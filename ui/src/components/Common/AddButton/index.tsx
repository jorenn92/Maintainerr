interface IAddButton {
    text: string
    onClick: () => void
  }
  
  const AddButton = (props: IAddButton) => {
    return <button className="w-full h-full m-auto shadow-md text-white rounded-full right-5 add-button" onClick={props.onClick}>{props.text}</button>
  }
  
  export default AddButton
  