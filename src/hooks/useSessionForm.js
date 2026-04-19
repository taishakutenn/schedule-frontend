import { useState, useCallback, useRef, useEffect } from "react";
import {
  createNewSession,
  updateSession,
  deleteSession,
  createStreamsSessions,
} from "../api/scheduleAPI";

import {
  buildSessionPayload,
  buildStreamPayload,
  parseCabinetValue,
} from "../services/sessionService";

import { formatGroupLabel } from "../utils/formatters";

export function useSessionForm({
  teacherInPlanData,
  subjectInCycleHoursData,
  subjectInCycleData,
  onSessionChange,
}) {
  // ============================================
  // Состояние формы
  // ============================================
  const [form, setForm] = useState({
    id: null,
    group: null,
    subject: null,
    sessionType: null,
    cabinet: null,
    isNew: true,
    isDelete: false,
    isUpdate: false,
    streams: [],
    streamSessions: [],
  });

  const [uiState, setUiState] = useState({
    isAnimating: false,
    isModalAnimating: false,
    textInModal: "Успешно сохранено",
    currentBorder: "--schedule-cell-border--default",
    subjectsOptionDisabled: true,
  });

  const [streamErrors, setStreamErrors] = useState([]);
  const [successfullyCreatedSessions, setSuccessfullyCreatedSessions] =
    useState([]);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Ref для доступа к актуальному form внутри асинхронных колбэков
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // ============================================
  // UI-хелперы
  // ============================================
  const showAnimation = useCallback((type) => {
    setUiState((prev) => ({ ...prev, isAnimating: false }));

    requestAnimationFrame(() => {
      setUiState((prev) => ({ ...prev, isAnimating: true }));
    });

    setUiState((prev) => ({ ...prev, isModalAnimating: true }));

    const borderMap = {
      create: "--schedule-cell-border--success",
      update: "--schedule-cell-border--success",
      error: "--schedule-cell-border--error",
      default: "--schedule-cell-border--default",
    };

    const textMap = {
      create: "Пара успешно сохранена",
      update: "Пара успешно обновлена",
      delete: "Пара успешно удалена",
      error: "Произошла ошибка",
      default: "Успешно сохранено",
    };

    setUiState((prev) => ({
      ...prev,
      currentBorder: borderMap[type] || borderMap.default,
      textInModal: textMap[type] || textMap.default,
    }));

    setTimeout(() => {
      setUiState((prev) => ({ ...prev, isModalAnimating: false }));
    }, 2600);
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      id: null,
      group: null,
      subject: null,
      sessionType: null,
      cabinet: null,
      isNew: true,
      isDelete: false,
      isUpdate: false,
      streams: [],
      streamSessions: [],
    });
  }, []);

  const setFormField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetBorder = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      currentBorder: "--schedule-cell-border--default",
    }));
  }, []);

  // ============================================
  // Бизнес-логика: создание сессии
  // ============================================
  const handleCreateSession = useCallback(
    async (sessionNumber, date) => {
      const currentForm = formRef.current;

      console.log("handleCreateSession: starting", {
        sessionNumber,
        date,
        form: {
          group: currentForm.group,
          subject: currentForm.subject,
          sessionType: currentForm.sessionType,
          cabinet: currentForm.cabinet,
          streams: currentForm.streams?.length,
        },
      });

      try {
        const payload = buildSessionPayload({
          form: currentForm,
          teacherInPlanData,
          subjectInCycleHoursData,
        });

        console.log("buildSessionPayload result:", payload);

        if (!payload) {
          showAnimation("error");
          console.error("buildSessionPayload вернул null. Проверьте:");
          console.log("teacherInPlanData:", teacherInPlanData?.slice(0, 3));
          console.log(
            "  • subjectInCycleHoursData:",
            subjectInCycleHoursData?.slice(0, 3),
          );
          console.log("form.group.value:", currentForm.group?.value);
          console.log("form.subject.value:", currentForm.subject?.value);
          return { success: false, error: "Не удалось собрать данные сессии" };
        }

        console.log("Calling createNewSession with:", {
          sessionNumber,
          date,
          payload,
        });

        const newSession = await createNewSession(
          sessionNumber,
          date,
          payload.teacherInPlanId,
          payload.sessionType,
          payload.cabinet,
          payload.building,
        );

        console.log("createNewSession response:", newSession);

        // Обновляем форму с ID новой сессии
        setForm((prev) => ({
          ...prev,
          id: newSession.session.id,
          isNew: false,
        }));

        showAnimation("create");

        // Обработка потоков (если есть)
        if (currentForm.streams?.length > 0) {
          const streamPayloads = buildStreamPayload({
            form: currentForm,
            teacherInPlanData,
            subjectInCycleHoursData,
            subjectInCycleData,
          });

          const result = await createStreamsSessions(
            currentForm,
            newSession.session.id,
            streamPayloads,
            sessionNumber,
            date,
          );

          // Сохраняем успешно созданные сессии для возможного отката
          setSuccessfullyCreatedSessions(result.createdSessions);

          const newStreamSessions = result.createdSessions
            .filter((s) => s.id !== newSession.session.id)
            .map((s) => ({ session: { id: s.id } }));

          setFormField("streamSessions", newStreamSessions);

          if (result.errors.length > 0) {
            setStreamErrors(result.errors);
            setIsErrorModalOpen(true);
            return {
              success: true,
              hasErrors: true,
              errors: result.errors,
              createdSessions: result.createdSessions,
            };
          } else {
            showAnimation("create");
            setUiState((prev) => ({
              ...prev,
              textInModal: "Потоковые пары успешно сохранены",
            }));
            return {
              success: true,
              message: "Потоковые пары успешно сохранены",
            };
          }
        }

        return { success: true };
      } catch (error) {
        const errorMessage =
          error.data?.detail?.msg ||
          error.data?.detail ||
          error.message ||
          "Ошибка при создании";
        setUiState((prev) => ({ ...prev, textInModal: errorMessage }));
        showAnimation("error");
        resetForm();
        return { success: false, error: errorMessage };
      }
    },
    [
      teacherInPlanData,
      subjectInCycleHoursData,
      subjectInCycleData,
      showAnimation,
      resetForm,
      setFormField,
    ],
  );

  // ============================================
  // Бизнес-логика: обновление сессии
  // ============================================
  const handleUpdateSession = useCallback(
    async (sessionId, sessionNumber, date) => {
      const currentForm = formRef.current;

      try {
        const payload = buildSessionPayload({
          form: currentForm,
          teacherInPlanData,
          subjectInCycleHoursData,
        });

        if (!payload) {
          showAnimation("error");
          return {
            success: false,
            error: "Не удалось собрать данные для обновления",
          };
        }

        await updateSession(
          sessionId,
          sessionNumber,
          date,
          payload.teacherInPlanId,
          payload.sessionType,
          payload.cabinet,
          payload.building,
        );

        // Сбрасываем флаг обновления
        setFormField("isUpdate", false);
        showAnimation("update");

        // Уведомляем родителя об изменении, если есть колбэк
        if (onSessionChange) {
          onSessionChange({ type: "updated", sessionId });
        }

        return { success: true, message: "Пара успешно обновлена" };
      } catch (error) {
        const errorMessage =
          error.data?.detail?.msg ||
          error.data?.detail ||
          error.message ||
          "Ошибка при обновлении";
        setUiState((prev) => ({ ...prev, textInModal: errorMessage }));
        showAnimation("error");
        return { success: false, error: errorMessage };
      }
    },
    [
      teacherInPlanData,
      subjectInCycleHoursData,
      showAnimation,
      setFormField,
      onSessionChange,
    ],
  );

  // ============================================
  // Бизнес-логика: удаление сессии
  // ============================================
  const handleDeleteSession = useCallback(
    async (sessionId, streamSessions) => {
      try {
        // Удаляем основную пару
        await deleteSession(sessionId);

        // Удаляем потоковые пары, если они есть
        if (streamSessions?.length > 0) {
          await Promise.all(
            streamSessions.map((stream) =>
              deleteSession(stream.session.id).catch((err) => {
                console.error("Ошибка при удалении потоковой пары:", err);
                // Не прерываем удаление, если одна из потоковых не удалилась
              }),
            ),
          );
        }

        // Сбрасываем флаг удаления
        setFormField("isDelete", false);

        // Сбрасываем форму
        resetForm();

        // Показываем анимацию успеха
        showAnimation("delete");

        // Сбрасываем бордер после анимации
        setTimeout(() => {
          resetBorder();
        }, 2600);

        // Уведомляем родителя
        if (onSessionChange) {
          onSessionChange({ type: "deleted", sessionId });
        }

        return { success: true, message: "Пара успешно удалена" };
      } catch (error) {
        const errorMessage =
          error.data?.detail?.msg ||
          error.data?.detail ||
          error.message ||
          "Ошибка при удалении";
        setUiState((prev) => ({ ...prev, textInModal: errorMessage }));
        showAnimation("error");
        console.error("Ошибка при удалении сессии:", error);
        return { success: false, error: errorMessage };
      }
    },
    [showAnimation, setFormField, resetForm, resetBorder, onSessionChange],
  );

  // ============================================
  // Откат успешно созданных потоковых сессий
  // ============================================
  const rollbackSuccessfullyCreatedSessions = useCallback(async () => {
    try {
      await Promise.all(
        successfullyCreatedSessions.map((session) =>
          deleteSession(session.id).catch((err) =>
            console.error("Ошибка при откате сессии:", err),
          ),
        ),
      );

      setSuccessfullyCreatedSessions([]);
      setIsErrorModalOpen(false);
      resetForm();
      resetBorder();

      return { success: true };
    } catch (error) {
      console.error("Критическая ошибка при откате сессий:", error);
      return { success: false, error: "Не удалось откатить изменения" };
    }
  }, [successfullyCreatedSessions, resetForm, resetBorder]);

  // ============================================
  // Синхронизация формы с серверными данными
  // ============================================
  const syncFormWithSession = useCallback(
    (
      sessionData,
      allStreamSessions,
      groupsOptions,
      subjectsOptions,
      sessionTypesOptions,
      cabinetsOptions,
    ) => {
      if (!sessionData) {
        resetForm();
        return;
      }

      const s = sessionData.session;

      // Находим группу через teacherInPlan
      const teacherInPlan = (teacherInPlanData || []).find(
        (tip) => tip.id === s.teacher_in_plan,
      );
      const groupValue = teacherInPlan?.group_name || null;

      // Находим предмет через цепочку: teacherInPlan → subjectInCycleHours → subjectInCycle
      const subjectInCycleHours = (subjectInCycleHoursData || []).find(
        (sch) => sch.id === teacherInPlan?.subject_in_cycle_hours_id,
      );
      const subjectInCycle = (subjectInCycleData || []).find(
        (sic) => sic.id === subjectInCycleHours?.subject_in_cycle_id,
      );

      // Формируем опции для селектов
      const findOption = (options, value) =>
        options?.find((o) => o.value === String(value)) || null;

      const groupOption = findOption(groupsOptions, groupValue);
      const subjectOption = findOption(subjectsOptions, subjectInCycle?.id);
      const sessionTypeOption = findOption(sessionTypesOptions, s.session_type);
      const cabinetOption = findOption(
        cabinetsOptions,
        `${s.building_number}-${s.cabinet_number}`,
      );

      // Вычисляем отображаемый label для группы с учётом потоков
      const displayedGroupLabel = formatGroupLabel(
        groupOption,
        allStreamSessions,
      );

      setForm((prev) => ({
        ...prev,
        id: s.id,
        group: groupOption
          ? { ...groupOption, label: displayedGroupLabel || groupOption.label }
          : null,
        subject: subjectOption,
        sessionType: sessionTypeOption,
        cabinet: cabinetOption,
        isNew: false,
        streamSessions: allStreamSessions,
      }));

      // Показываем анимацию появления
      showAnimation("default");
      setUiState((prev) => ({
        ...prev,
        isModalAnimating: false,
        isAnimating: true,
      }));
    },
    [
      teacherInPlanData,
      subjectInCycleHoursData,
      subjectInCycleData,
      showAnimation,
    ],
  );

  // ============================================
  // Обновление label группы при изменении потоков
  // ============================================
  const updateGroupLabel = useCallback((mainGroup, streams, streamSessions) => {
    if (!mainGroup || !streams?.length || !streamSessions?.length) {
      return mainGroup;
    }

    const newLabel = formatGroupLabel(mainGroup, streams);

    if (mainGroup.label !== newLabel) {
      return { ...mainGroup, label: newLabel };
    }

    return mainGroup;
  }, []);

  // ============================================
  // Публичный API хука
  // ============================================
  return {
    // Состояние формы
    form,

    // UI-состояние
    uiState,

    // Состояние модальных окон
    streamErrors,
    successfullyCreatedSessions,
    isErrorModalOpen,
    setIsErrorModalOpen,
    setStreamErrors,

    // Методы для изменения формы
    setFormField,
    resetForm,

    // Действия с сессиями
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,

    // Утилиты
    rollbackSuccessfullyCreatedSessions,
    syncFormWithSession,
    updateGroupLabel,

    // UI-хелперы
    showAnimation,
    resetBorder,
  };
}
