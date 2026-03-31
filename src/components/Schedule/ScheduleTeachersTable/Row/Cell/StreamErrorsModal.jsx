import Modal from "../../../../Modal/Modal";
import Button from "../../../../Button/Button";

export default function StreamErrorsModal({
  isOpen,
  onClose,
  streamErrors,
  successfullyCreatedSessions,
  onRollback,
  onCloseModal,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ошибки при создании потоковых пар"
      size="lg"
    >
      <div className="streams-errors-container">
        <p className="streams-errors-message">
          Следующие пары не удалось создать:
        </p>
        <table className="streams-errors-table">
          <thead>
            <tr>
              <th>Группа</th>
              <th>Предмет</th>
              <th>Тип</th>
              <th>Кабинет</th>
              <th>Ошибка</th>
            </tr>
          </thead>
          <tbody>
            {streamErrors.map((streamError, index) => (
              <tr key={index}>
                <td>{streamError.group}</td>
                <td>{streamError.subject}</td>
                <td>{streamError.sessionType}</td>
                <td>{streamError.cabinet}</td>
                <td className="streams-errors-table__error">
                  {streamError.error}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {successfullyCreatedSessions.length > 0 && (
          <div className="streams-errors-actions">
            <p>Успешно создано пар: {successfullyCreatedSessions.length}</p>
            <Button variant="danger" onClick={() => onCloseModal(false)}>
              Оставить сохранённые пары
            </Button>
            <Button variant="primary" onClick={onRollback}>
              Откатить все сохранения
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
