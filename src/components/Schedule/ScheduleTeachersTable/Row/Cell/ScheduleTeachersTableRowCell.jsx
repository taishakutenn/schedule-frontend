import "./scheduleTeachersTableRowCell.css";
import "react-contexify/ReactContexify.css";

import { useContext, useState, useEffect, useMemo } from "react";
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

import SyncSelect from "../../../../CustomSelect/syncSelect";
import StreamErrorsModal from "./streamErrorsModal";

function ModalMessage({ text }) {
  return <div className="modal-in-container">{text}</div>;
}

export default function ScheduleTeachersTableCell({
  classCell,
  date,
  sessionNumber,
}) {
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

  // По умолчанию предметов нет
  const [subjectsOptions, setSubjectsOptions] = useState([]);

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
  // Состояния (states)
  // ============================================

  // Состояния для анимаций
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [textInModal, setTextInModal] = useState("Успешно сохранено");
  const [currentBorder, setCurrentBorder] = useState(
    "--schedule-cell-border--default",
  );

  // Состояние для доступности предметов
  const [subjectsOptionDisabled, setSubjectsOptionDisabled] = useState(true);

  // Состояния для модального окна с ошибками при создании пар
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [streamErrors, setStreamErrors] = useState([]);
  const [successfullyCreatedSessions, setSuccessfullyCreatedSessions] =
    useState([]);

  // Состояние формы
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

  // Функция для сброса формы к начальному состоянию
  const resetForm = () => {
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
  };

  // Функция для отката успешно созданных пар при потоках, если у одной хотя бы ошибка
  const rollbackSuccessfullyCreatedSessions = async () => {
    try {
      // Удаляем все успешно созданные сессии
      await Promise.all(
        successfullyCreatedSessions.map((session) => deleteSession(session.id)),
      );

      // Очищаем массив успешно созданных сессий
      setSuccessfullyCreatedSessions([]);
      setIsErrorModalOpen(false);

      // Очищаем форму и сбрасываем бордер
      resetForm();
      setTimeout(() => {
        setCurrentBorder("--schedule-cell-border--default");
      }, 1000);
    } catch (error) {
      console.error("Ошибка при откате сессий:", error);
    }
  };

  // ============================================
  // Анимации
  // ============================================
  const handleSelectChange = (type) => {
    setIsAnimating(false);

    requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    setIsModalAnimating(true);

    if (type === "create" || type === "update") {
      setCurrentBorder("--schedule-cell-border--success");
      setTextInModal("Пара успешно сохранена");
    } else if (type === "error") {
      setCurrentBorder("--schedule-cell-border--error");
    } else {
      setCurrentBorder("--schedule-cell-border--default");
    }

    setTimeout(() => {
      setIsModalAnimating(false);
    }, 2600);
  };

  // ============================================
  // Контекстное меню
  // ============================================

  // Инициализация контекстного меню
  const { show } = useContextMenu({
    id: "teacher-menu",
  });

  // Обработчик нажатия на правую кнопку мыши
  const handleRightClick = (e) => {
    if (!form.isNew) {
      console.log(form);
      e.preventDefault();
      show({
        event: e,
        props: {
          sessionId: form.id,
          handleFunctionCallback: handleMenuAction,
        },
      });
    }
  };

  // Обработчик действий из контекстного меню
  const handleMenuAction = (actionType) => {
    if (actionType === "update") {
      setFormField("isUpdate", true);
    } else if (actionType === "delete") {
      setFormField("isDelete", true);
    }
  };

  // ============================================
  // Обработчики изменений формы
  // ============================================

  // Функция для изменения полей формы
  const changeField = (field) => (value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Функция для быстрой установки одного поля формы
  const setFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Функция для получения объекта по значению из массива опций
  const findOption = (options, value) =>
    options.find((o) => o.value === String(value)) || null;

  // ============================================
  // Функции с парой
  // ============================================

  // Отслеживаем выбор группы, предмета и типа пары для подгрузки предметов и потоков
  useEffect(() => {
    const loadSubjects = async () => {
      if (!form.group) {
        setSubjectsOptionDisabled(true);
        return;
      }

      try {
        const subjects = await getSubjectsByGroupNameAndTeacherId(
          form.group.value,
          teacherInfo.id,
        );

        const formattedSubjects = subjects.map((subject) => ({
          value: `${subject.id}`,
          label: `${subject.title}`,
        }));

        // Обновляем subjectsOptions
        setSubjectsOptions(formattedSubjects);
        setSubjectsOptionDisabled(false);
      } catch (error) {
        setSubjectsOptionDisabled(true);
      }
    };

    const loadStreams = async () => {
      // Подгрузка потоков
      if (
        !form.group ||
        !form.subject ||
        !form.sessionType ||
        form.sessionType.value !== "Лк"
      ) {
        return;
      }

      try {
        // Подгружаем потоки для этого предмета
        const streams = await getStreamsRelatedToGroup(
          form.group.value,
          form.subject.value,
        );

        // Убираем из потоков текущую группу
        const filteredStreams = streams.streams.filter(
          (streamItem) => streamItem.group_name !== form.group.value,
        );

        if (filteredStreams.length < 1) {
          return;
        }

        setFormField("streams", filteredStreams);
      } catch (error) {
        console.error("Ошибка при подгрузке потоков:", error);
      }
    };

    loadSubjects();
    loadStreams();
  }, [form.group, form.subject, form.sessionType]);

  // Отслеживаем изменения потоков и потоковых лекций, чтобы правильно рисовать label
  useEffect(() => {
    // Обновляем label, если есть потоки и пара не новая
    if (
      !form.isNew &&
      form.group &&
      form.streams &&
      form.streams.length > 0 &&
      form.streamSessions &&
      form.streamSessions.length > 0
    ) {
      // Собираем все группы: основную + потоки
      const allGroups = [
        form.group.value,
        ...form.streams.map((stream) => stream.group_name),
      ];

      // Группируем по префиксу до "-"
      const groupedLabels = allGroups.map((group) => {
        const dashIndex = group.indexOf("-");
        // Если есть "-", берём часть до него, иначе оставляем как есть
        return dashIndex !== -1 ? group.substring(0, dashIndex) : group;
      });

      // Убираем дубликаты
      const uniqueGroups = [...new Set(groupedLabels)];

      const newLabel = uniqueGroups.join(", ");

      // Обновляем label только если он отличается от текущего
      if (form.group.label !== newLabel) {
        setForm((prev) => ({
          ...prev,
          group: {
            ...prev.group,
            label: newLabel,
          },
        }));
      }
    }
  }, [form.streams, form.streamSessions]);

  // Отслеживаем заполненность формы для создания, редактирования или удаления пары
  useEffect(() => {
    const submitForm = async () => {
      // Если создаём пару
      if (
        form.isNew &&
        !form.id &&
        form.group &&
        form.subject &&
        form.sessionType &&
        form.cabinet
      ) {
        try {
          const payload = getSessionPayload();
          if (!payload) {
            handleSelectChange("error");
            return;
          }

          // Отправляем данные на сервер
          const newSession = await createNewSession(
            sessionNumber,
            date,
            payload.teacherInPlanId,
            payload.sessionType,
            payload.cabinet,
            payload.building,
          );

          // Делаем пару не новой и присваиваем ей id
          setFormField("id", newSession.session.id);
          setFormField("isNew", false);

          handleSelectChange("create");

          // Проверяем, есть ли у пары потоки
          if (form.streams.length > 0) {
            // Если есть, то создаём пары и для них
            const streamsSessionData = getStreamsSessionData(); // Все данные о потоках

            // Создаём пары из потоков и получаем информацию о успешных и неуспешных операциях
            const resultCreatingSessions = await createStreamsSessions(
              form,
              newSession.session.id,
              streamsSessionData,
              sessionNumber,
              date,
            );

            // Сохраняем информацию об успешно созданных сессиях
            setSuccessfullyCreatedSessions(
              resultCreatingSessions.createdSessions,
            );

            // Преобразовываем данные потоковых пар к удобному формату
            // Фильтруем основную пару (она не должна попасть в streamSessions)
            const newStreamSessions = resultCreatingSessions.createdSessions
              .filter((sessionData) => sessionData.id !== newSession.session.id)
              .map((sessionData) => ({
                session: {
                  id: sessionData.id,
                },
              }));

            // Обновляем форму с добавленными streamSessions
            setFormField("streamSessions", newStreamSessions);

            // Если есть ошибки, открываем модальное окно
            if (resultCreatingSessions.errors.length > 0) {
              setStreamErrors(resultCreatingSessions.errors);
              setIsErrorModalOpen(true);
            } else {
              // Показываем, что все потоковые пары сохранились
              setTextInModal("Потоковые пары успешно сохранены");
              handleSelectChange("create");
            }
          }
        } catch (error) {
          const errorMessage =
            error.data?.detail?.msg ||
            error.data?.detail ||
            error.message ||
            "Произошла ошибка при создании";
          setTextInModal(errorMessage);
          handleSelectChange("error");
          resetForm();
        }
      } else if (
        // Если обновляем пару
        !form.isNew &&
        form.id &&
        form.group &&
        form.subject &&
        form.sessionType &&
        form.cabinet &&
        form.isUpdate
      ) {
        try {
          const payload = getSessionPayload();

          if (!payload) {
            handleSelectChange("error");
            return;
          }

          // Обновляем пару
          const updatedSession = await updateSession(
            form.id,
            sessionNumber,
            date,
            payload.teacherInPlanId,
            payload.sessionType,
            payload.cabinet,
            payload.building,
          );

          // Сбрасываем флаг обновления
          setFormField("isUpdate", false);

          handleSelectChange("update");
          setTextInModal("Пара успешно обновлена");
        } catch (error) {
          setTextInModal(error.data || "Произошла ошибка при обновлении");
          handleSelectChange("error");
        }
      } else if (
        // Если удаляем пару
        !form.isNew &&
        form.id &&
        form.isDelete
      ) {
        try {
          // Удаляем основную пару
          await deleteSession(form.id);

          // Удаляем потоковые пары, если они есть
          if (form.streamSessions && form.streamSessions.length > 0) {
            await Promise.all(
              form.streamSessions.map((stream) =>
                deleteSession(stream.session.id),
              ),
            );
          }

          // Сбрасываем флаг удаления
          setFormField("isDelete", false);

          // Сбрасываем форму
          resetForm();

          // Показываем анимацию
          setTextInModal("Пара успешно удалена");
          handleSelectChange("create");

          // Сбрасываем бордер
          setTimeout(() => {
            setCurrentBorder("--schedule-cell-border--default");
          }, 2600);
        } catch (error) {
          setTextInModal(
            error.data?.detail?.msg || "Произошла ошибка при удалении",
          );
          handleSelectChange("error");
          console.log(error);
        }
      }
    };

    submitForm();
  }, [form]);

  // Функция для получения данных сессии для отправки на сервер
  const getSessionPayload = () => {
    // Находим teacher_in_plan по группе и предмету
    const teacherInPlan = teacherInPlanData.find((tip) => {
      const hasGroup = tip.group_name === form.group.value;
      const hasSubject = subjectInCycleHoursData.some(
        (sch) =>
          sch.id === tip.subject_in_cycle_hours_id &&
          sch.subject_in_cycle_id === parseInt(form.subject.value),
      );
      return hasGroup && hasSubject;
    });

    if (!teacherInPlan) {
      return null;
    }

    // Разбираем cabinet на building и cabinet number
    const [building, cabinet] = form.cabinet.value.split("-");

    return {
      teacherInPlanId: teacherInPlan.id,
      sessionType: form.sessionType.value,
      cabinet,
      building,
    };
  };

  // Функция для получения данных сессий для потоков
  const getStreamsSessionData = () => {
    if (!form.streams || form.streams.length === 0) {
      return [];
    }

    return form.streams
      .map((stream) => {
        // Получаем id часов предмета по id предмета из стрима
        const subjectInCycleHours = subjectInCycleHoursData.find(
          (sch) => sch.subject_in_cycle_id === stream.subject_id,
        );

        if (!subjectInCycleHours) {
          return null;
        }

        // Получаем id учителя в плане для создания пары
        const teacherInPlan = teacherInPlanData.find(
          (tip) =>
            tip.subject_in_cycle_hours_id === subjectInCycleHours.id &&
            tip.group_name === stream.group_name,
        );

        if (!teacherInPlan) {
          return null;
        }

        // Разбираем cabinet на building и cabinet number
        const [building, cabinet] = form.cabinet.value.split("-");

        // Возвращаем объект с данными для создания пары
        return {
          teacherInPlanId: teacherInPlan.id,
          sessionType: form.sessionType.value,
          cabinet,
          building,
        };
      })
      .filter((item) => item !== null);
  };

  // ============================================
  // Подгрузка пар
  // ============================================

  // Получаем занятие на текущую пару и потоки, если есть
  const formattedDate = date.toISOString().split("T")[0];
  const allSessions = (teacherSessions?.sessions || []).filter((item) => {
    return (
      item.session.session_date === formattedDate &&
      item.session.session_number === sessionNumber
    );
  });

  // Текущая пара - первый элемент из всех пар на текущую дату и номер пары
  const currentSession = allSessions[0];
  const streamSessions = allSessions.slice(1); // Все остальные - потоковые

  // Отслеживаем изменения с сервера
  useEffect(() => {
    if (!currentSession) {
      // пары нет - форма пустая
      resetForm();
      return;
    }

    // Пара есть - заполняем форму
    const s = currentSession.session;

    // Группу берём из teacher in plan data по id teacher in plan из сессии
    const teacherInPlan = (teacherInPlanData || []).find(
      (tip) => tip.id === s.teacher_in_plan,
    );
    const group = teacherInPlan?.group_name || null;

    // Предмет берём по такой цепочке:
    // 1) в teacher in plan id часов предмета (subject_in_cycle_hours_id)
    // 2) в часах предмета айди предмета (subject_in_cycle_id)
    // 3) по айди предмета в subjectInCycleData находим данные
    const subjectInCycleHours = (subjectInCycleHoursData || []).find(
      (sch) => sch.id === teacherInPlan?.subject_in_cycle_hours_id,
    );
    const subjectInCycle = (subjectInCycleData || []).find(
      (sic) => sic.id === subjectInCycleHours?.subject_in_cycle_id,
    );

    setForm((prev) => ({
      ...prev,
      id: s.id,
      group: findOption(groupsOptions, group),
      subject: findOption(subjectsOptions, subjectInCycle?.id),
      sessionType: findOption(sessionTypesOptions, s.session_type),
      cabinet: findOption(
        cabinetsOptions,
        `${s.building_number}-${s.cabinet_number}`,
      ),
      isNew: false,
      streamSessions: streamSessions,
    }));

    // Включаем анимацию бордера и задаём ей цвет
    handleSelectChange();
    setIsModalAnimating(false);
    setIsAnimating(true);
  }, [
    currentSession,
    teacherInPlanData,
    subjectInCycleHoursData,
    subjectInCycleData,
  ]);

  return (
    <td className={classCell}>
      <div
        className={`cell-container ${
          isAnimating ? "cell-container--animated" : ""
        }`}
        style={{
          "--animation-border-color": `var(${currentBorder})`,
        }}
      >
        <div className="cell-for-animation-container">
          {isModalAnimating ? <ModalMessage text={textInModal} /> : null}

          <div className="cell-container__column left-column">
            <div
              className={`select-wrapper ${
                form.streamSessions && form.streamSessions.length > 0
                  ? "select-wrapper_group"
                  : ""
              }`}
              onContextMenu={handleRightClick}
            >
              <SyncSelect
                options={groupsOptions}
                placeholder="Группа"
                value={form.group}
                onChange={changeField("group")}
              />
            </div>
            <div className="select-wrapper" onContextMenu={handleRightClick}>
              <SyncSelect
                options={subjectsOptions}
                placeholder="Предмет"
                value={form.subject}
                onChange={changeField("subject")}
                isDisabled={subjectsOptionDisabled}
              />
            </div>
          </div>

          <div className="cell-container__column right-column">
            <div className="select-wrapper" onContextMenu={handleRightClick}>
              <SyncSelect
                options={sessionTypesOptions}
                placeholder="Тип пары"
                value={form.sessionType}
                onChange={changeField("sessionType")}
              />
            </div>
            <div className="select-wrapper" onContextMenu={handleRightClick}>
              <SyncSelect
                options={cabinetsOptions}
                placeholder="Кабинет"
                value={form.cabinet}
                onChange={changeField("cabinet")}
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
