import InfoBlock from "../components/infoBlock/InfoBlock";

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
      <InfoBlock items={infoItems} />
    </main>
  );
}
