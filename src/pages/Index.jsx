import InfoBlock from "../components/InfoBlock/InfoBlock";
import InfoButton from "../components/InfoButton/InfoButton";

const infoItems = [
  {
    title: "Schedule",
    text: [
      "Это инструмент, помогающий в составлении расписания оператору факультета СПО.",
    ],
  },
];

export default function Index() {
  return (
    <main>
      <InfoButton textName="default" />
      <InfoBlock items={infoItems} />
    </main>
  );
}
