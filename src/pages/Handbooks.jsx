import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import { useState } from "react";
import HandbookTable from "../components/HandbookTable/HandbookTable";
import { useApiData } from "../hooks/useApiData";
import { tableConfig } from "../utils/tableConfig";

import "./Handbook.css";

const headerInfo = [
  {
    title: "Справочная информация",
    text: [],
  },
];

export default function Handbooks() {
  const [handbook, setHandbook] = useState(null);
  const [search, setSearch] = useState("");

  // get data from API with custom hook
  const currentTableConfig = tableConfig[handbook];
  const { data, loading, error } = useApiData(
    currentTableConfig?.apiFunction || (() => []),
    [handbook], // request when table changed
    !!currentTableConfig
  );

  // set handbook states
  const handleTeacher = () => setHandbook("teachers");
  const handleTeacherCategory = () => setHandbook("teachers_category");

  // Function that filtered data
  const getFilteredData = (data, search) => {
    if (!search) return data;

    const lowerSearch = search.toLowerCase();
    return data.filter((item) => {
      return Object.values(item).some((value) => {
        return String(value).toLowerCase().includes(lowerSearch);
      });
    });
  };

  // return content depending on the state handbook
  const renderContent = () => {
    if (!currentTableConfig) return null;

    if (loading)
      return (
        <div className="request-loading">
          {currentTableConfig.loadingMessage}
        </div>
      );
    if (error)
      return (
        <div className="request-error">
          {currentTableConfig.errorMessage}: {error}
        </div>
      );

    // filter data before send it to table creator
    const filteredData = getFilteredData(data, search);

    // create table with filtered data
    return <HandbookTable apiResponse={filteredData} tableName={handbook} />;
  };

  return (
    <main>
      <InfoBlock items={headerInfo} />{" "}
      <div className="handbooks__navigation">
        <Button onClick={handleTeacher}>Преподаватели</Button>
        <Button onClick={handleTeacherCategory}>
          Категории преподавателей
        </Button>
        <Button>Специальности</Button>
        <Button>Кабинеты</Button>
        <Button>Типы занятий</Button>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearch("")}>Очистить</Button>
      </div>
      <div className="rendered-table">{renderContent()}</div>
    </main>
  );
}
