import "./GroupPlate.css";

export default function GroupPlate({ groupElements }) {
  return (
    <div className="group-plate">
      {groupElements &&
        Array.isArray(groupElements) &&
        groupElements.map((Element, index) => Element)}
    </div>
  );
}
