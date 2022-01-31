interface IDeleteButton {
    text: string
    onClick: () => void
  }
  
  const DeleteButton = (props: IDeleteButton) => {
    return <button className="w-full h-8 m-auto shadow-md text-white rounded right-5 delete-button" onClick={props.onClick}>{props.text}</button>
  }
  
  export default DeleteButton
  