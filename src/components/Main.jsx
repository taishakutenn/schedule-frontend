import InfoBlock from "./infoBlock/InfoBlock";

const infoItems = [
  {
    title: "Schedule",
    text: [
      "Это инструмент, помогающий в составлении расписания оператору факультета СПО.",
    ],
  },
];

export default function Main() {
  return (
    <main>
      <InfoBlock items={infoItems} />
    </main>
  );
}
