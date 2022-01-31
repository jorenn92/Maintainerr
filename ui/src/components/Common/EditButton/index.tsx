interface IEditButton {
  text: string
  onClick: () => void
}

const EditButton = (props: IEditButton) => {
  return <button className="w-full h-8 m-auto shadow-md text-white rounded right-5 edit-button" onClick={props.onClick}>{props.text}</button>
}

export default EditButton
