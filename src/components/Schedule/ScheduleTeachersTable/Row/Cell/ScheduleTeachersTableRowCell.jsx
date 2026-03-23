import "./scheduleTeachersTableRowCell.css";
import "react-contexify/ReactContexify.css";

import { useContext, useState, useEffect } from "react";
import { useContextMenu } from "react-contexify";
import ScheduleTeachersTableContext from "../../../../../contexts/ScheduleTeachersTableContext";
import {
  createNewSession,
  updateSession,
  deleteSession,
} from "../../../../../api/scheduleAPI";

import SyncSelect from "../../../../CustomSelect/syncSelect";

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
  const groupsOptions = groups.map((group) => ({
    value: group,
    label: group,
  }));

  const subjectsOptions =
    subjectInCycleData.map((subject) => ({
      value: `${subject.id}`,
      label: `${subject.title}`,
    })) || [];

  const sessionTypesOptions = sessionsTypes.map((type) => ({
    value: `${type.name}`,
    label: `${type.name}`,
  }));

  const cabinetsOptions = cabinets.map((cabinet) => ({
    value: `${cabinet.building_number}-${cabinet.cabinet_number}`,
    label: `${cabinet.building_number}-${cabinet.cabinet_number}`,
  }));

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
    });
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
        } catch (error) {
          setTextInModal(
            error.data?.detail?.msg || "Произошла ошибка при создании",
          );
          handleSelectChange("error");
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
          setTextInModal(
            error.data?.detail?.msg || "Произошла ошибка при обновлении",
          );
          handleSelectChange("error");
        }
      } else if (
        // Если удаляем пару
        !form.isNew &&
        form.id &&
        form.isDelete
      ) {
        try {
          // Отправляем запрос на удаление
          await deleteSession(form.id);

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
      console.error("Не найдено teacher_in_plan для выбранных данных");
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

  // ============================================
  // Подгрузка пар
  // ============================================

  // Получаем занятие на текущую пару
  const formattedDate = date.toISOString().split("T")[0];
  const currentSession = (teacherSessions?.sessions || []).find((item) => {
    return (
      item.session.session_date === formattedDate &&
      item.session.session_number === sessionNumber
    );
  });

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

    setForm({
      id: s.id,
      group: findOption(groupsOptions, group),
      subject: findOption(subjectsOptions, subjectInCycle?.id),
      sessionType: findOption(sessionTypesOptions, s.session_type),
      cabinet: findOption(
        cabinetsOptions,
        `${s.building_number}-${s.cabinet_number}`,
      ),
      isNew: false,
    });

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
            <div className="select-wrapper" onContextMenu={handleRightClick}>
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
    </td>
  );
}
