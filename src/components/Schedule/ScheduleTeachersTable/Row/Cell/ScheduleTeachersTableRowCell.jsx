import "./scheduleTeachersTableRowCell.css";
import "react-contexify/ReactContexify.css";

import {
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
  memo,
} from "react";
import { useContextMenu } from "react-contexify";
import ScheduleTeachersTableContext from "../../../../../contexts/ScheduleTeachersTableContext";
import {
  createNewSession,
  updateSession,
  deleteSession,
  createStreamsSessions,
} from "../../../../../api/scheduleAPI";
import { getStreamsRelatedToGroup } from "../../../../../api/streamAPI";
import { getSubjectsByGroupNameAndTeacherId } from "../../../../../api/groupAPI";

import { useSessionForm } from "../../../../../hooks/useSessionForm";
import { formatGroupLabel } from "../../../../../utils/formatters";

import SyncSelect from "../../../../CustomSelect/syncSelect";
import StreamErrorsModal from "./streamErrorsModal";

function ModalMessage({ text }) {
  return <div className="modal-in-container">{text}</div>;
}

function ScheduleTeachersTableCell({ classCell, date, sessionNumber }) {
  // ============================================
  // Контекст
  // ============================================
  const scheduleTeachersTableContext = useContext(ScheduleTeachersTableContext);
  const {
    cabinets,
    sessionsTypes,
    teacherInfo,
    teacherInPlanData,
    subjectInCycleHoursData,
    subjectInCycleData,
    groups,
    teacherSessions,
  } = scheduleTeachersTableContext;

  // // Logging context data
  // console.log("scheduleTeachersTableContext:", scheduleTeachersTableContext);
  // console.log("cabinets:", cabinets);
  // console.log("sessionsTypes:", sessionsTypes);
  // console.log("teacherInfo:", teacherInfo);
  // console.log("teacherInPlanData:", teacherInPlanData);
  // console.log("subjectInCycleHoursData:", subjectInCycleHoursData);
  // console.log("subjectInCycleData:", subjectInCycleData);
  // console.log("groups:", groups);
  // console.log("teacherSessions:", teacherSessions);

  // ============================================
  // Подготовка данных для селектов
  // ============================================
  const groupsOptions = useMemo(
    () =>
      groups.map((group) => ({
        value: group,
        label: group,
      })),
    [groups],
  );

  const [subjectsOptions, setSubjectsOptions] = useState([]);
  const [subjectsDisabled, setSubjectsDisabled] = useState(true);

  const sessionTypesOptions = useMemo(
    () =>
      sessionsTypes.map((type) => ({
        value: `${type.name}`,
        label: `${type.name}`,
      })),
    [sessionsTypes],
  );

  const cabinetsOptions = useMemo(
    () =>
      cabinets.map((cabinet) => ({
        value: `${cabinet.building_number}-${cabinet.cabinet_number}`,
        label: `${cabinet.building_number}-${cabinet.cabinet_number}`,
      })),
    [cabinets],
  );

  // ============================================
  // Бизнес-логика — делегируем хуку
  // ============================================
  const {
    form,
    uiState,
    streamErrors,
    successfullyCreatedSessions,
    isErrorModalOpen,
    setIsErrorModalOpen,
    setStreamErrors,
    setFormField,
    resetForm,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    rollbackSuccessfullyCreatedSessions,
    syncFormWithSession,
    updateGroupLabel,
  } = useSessionForm({
    teacherInPlanData,
    subjectInCycleHoursData,
    subjectInCycleData,
    onSessionChange: (change) => {
      // При необходимости синхронизируем с родителем
      console.log("Session changed:", change);
    },
  });

  // ============================================
  // Эффект: подгрузка предметов при смене группы
  // ============================================
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadSubjects = async () => {
      if (!form.group?.value) {
        if (isMounted) {
          setSubjectsOptions([]);
          setSubjectsDisabled(true);
        }
        return;
      }

      try {
        const subjects = await getSubjectsByGroupNameAndTeacherId(
          form.group.value,
          teacherInfo.id,
          { signal: abortController.signal },
        );

        if (!isMounted) return;

        const formattedSubjects = subjects.map((subject) => ({
          value: `${subject.id}`,
          label: `${subject.title}`,
        }));

        setSubjectsOptions(formattedSubjects);

        setSubjectsDisabled(false);
      } catch (error) {
        if (error.name !== "AbortError" && isMounted) {
          setSubjectsOptions([]);
          setSubjectsDisabled(true);
          if (error.name !== "AbortError" && isMounted) {
            setSubjectsOptions([]);
          }
        }
      }
    };

    if (form.group?.value) {
      loadSubjects();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [form.group?.value, teacherInfo.id]);

  // ============================================
  // Эффект: подгрузка потоков при смене группы/предмета/типа
  // ============================================
  useEffect(() => {
    const loadStreams = async () => {
      if (
        !form.group?.value ||
        !form.subject?.value ||
        !form.sessionType?.value ||
        form.sessionType.value.toUpperCase() !== "ЛК"
      ) {
        return;
      }

      try {
        const streams = await getStreamsRelatedToGroup(
          form.group.value,
          form.subject.value,
        );

        const filteredStreams = streams.streams.filter(
          (streamItem) => streamItem.group_name !== form.group.value,
        );

        if (filteredStreams.length > 0) {
          setFormField("streams", filteredStreams);
        }
      } catch (error) {
        console.error("Ошибка при подгрузке потоков:", error);
      }
    };

    loadStreams();
  }, [
    form.group?.value,
    form.subject?.value,
    form.sessionType?.value,
    setFormField,
  ]);

  // ============================================
  // Эффект: обновление label группы при изменении потоков
  // ============================================
  useEffect(() => {
    if (
      !form.isNew &&
      form.group &&
      form.streams?.length > 0 &&
      form.streamSessions?.length > 0
    ) {
      const updatedGroup = updateGroupLabel(
        form.group,
        form.streams,
        form.streamSessions,
      );
      if (updatedGroup !== form.group) {
        setFormField("group", updatedGroup);
      }
    }
  }, [
    form.streams,
    form.streamSessions,
    form.isNew,
    form.group,
    updateGroupLabel,
    setFormField,
  ]);

  // ============================================
  // Эффект: триггеры действий (создание/обновление/удаление)
  // ============================================

  // Создание
  useEffect(() => {
    if (
      form.isNew &&
      !form.id &&
      form.group &&
      form.subject &&
      form.sessionType &&
      form.cabinet
    ) {
      handleCreateSession(sessionNumber, date);
    }
  }, [
    form.isNew,
    form.id,
    form.group,
    form.subject,
    form.sessionType,
    form.cabinet,
    handleCreateSession,
    sessionNumber,
    date,
  ]);

  // Обновление
  useEffect(() => {
    if (form.isUpdate && form.id) {
      handleUpdateSession(form.id, sessionNumber, date);
    }
  }, [form.isUpdate, form.id, handleUpdateSession, sessionNumber, date]);

  // Удаление
  useEffect(() => {
    if (form.isDelete && form.id) {
      handleDeleteSession(form.id, form.streamSessions);
    }
  }, [form.isDelete, form.id, form.streamSessions, handleDeleteSession]);

  // ============================================
  // Эффект: синхронизация формы с серверными данными
  // ============================================
  useEffect(() => {
    const formattedDate = date.toISOString().split("T")[0];
    const allSessions = (teacherSessions?.sessions || []).filter((item) => {
      return (
        item.session.session_date === formattedDate &&
        item.session.session_number === sessionNumber
      );
    });

    const currentSession = allSessions[0];
    const streamSessions = allSessions.slice(1);

    syncFormWithSession(
      currentSession,
      streamSessions,
      groupsOptions,
      subjectsOptions,
      sessionTypesOptions,
      cabinetsOptions,
    );
  }, [teacherSessions, date, sessionNumber, syncFormWithSession]);

  // ============================================
  // Контекстное меню
  // ============================================
  const { show } = useContextMenu({ id: "teacher-menu" });

  const handleRightClick = useCallback(
    (e) => {
      if (!form.isNew) {
        e.preventDefault();
        show({
          event: e,
          props: {
            sessionId: form.id,
            handleFunctionCallback: (actionType) => {
              if (actionType === "update") {
                setFormField("isUpdate", true);
              } else if (actionType === "delete") {
                setFormField("isDelete", true);
              }
            },
          },
        });
      }
    },
    [form.isNew, form.id, show, setFormField],
  );

  // ============================================
  // Обработчики для SyncSelect
  // ============================================
  const handleChange = useCallback(
    (field) => (value) => {
      setFormField(field, value);
    },
    [setFormField],
  );

  // ============================================
  // Рендер
  // ============================================
  return (
    <td className={classCell}>
      <div
        className={`cell-container ${
          uiState.isAnimating ? "cell-container--animated" : ""
        }`}
        style={{
          "--animation-border-color": `var(${uiState.currentBorder})`,
        }}
      >
        <div className="cell-for-animation-container">
          {uiState.isModalAnimating && (
            <ModalMessage text={uiState.textInModal} />
          )}

          <div className="cell-container__column left-column">
            <div
              className={`select-wrapper ${
                form.streamSessions?.length > 0 ? "select-wrapper_group" : ""
              }`}
              onContextMenu={handleRightClick}
            >
              <SyncSelect
                options={groupsOptions}
                placeholder="Группа"
                value={form.group}
                onChange={handleChange("group")}
              />
            </div>
            <div className="select-wrapper" onContextMenu={handleRightClick}>
              <SyncSelect
                options={subjectsOptions}
                placeholder="Предмет"
                value={form.subject}
                onChange={handleChange("subject")}
                isDisabled={subjectsDisabled}
              />
            </div>
          </div>

          <div className="cell-container__column right-column">
            <div className="select-wrapper" onContextMenu={handleRightClick}>
              <SyncSelect
                options={sessionTypesOptions}
                placeholder="Тип пары"
                value={form.sessionType}
                onChange={handleChange("sessionType")}
              />
            </div>
            <div className="select-wrapper" onContextMenu={handleRightClick}>
              <SyncSelect
                options={cabinetsOptions}
                placeholder="Кабинет"
                value={form.cabinet}
                onChange={handleChange("cabinet")}
              />
            </div>
          </div>
        </div>
      </div>

      <StreamErrorsModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        streamErrors={streamErrors}
        successfullyCreatedSessions={successfullyCreatedSessions}
        onRollback={rollbackSuccessfullyCreatedSessions}
        onCloseModal={setStreamErrors}
      />
    </td>
  );
}

export default memo(ScheduleTeachersTableCell, (prevProps, nextProps) => {
  // Кастомная проверка: ререндерить только если изменилось что-то важное
  return (
    prevProps.classCell === nextProps.classCell &&
    prevProps.date.getTime() === nextProps.date.getTime() &&
    prevProps.sessionNumber === nextProps.sessionNumber
  );
});
