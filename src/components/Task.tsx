import css from "./Task.module.css"


interface TaskProps {
    id: number;
    text: string;
    completed: boolean;
    status:string
    deleteTask: (id: number) => void;
    toggleTaskCompletion: (id: number) => void;
}   

export function Task({ id, text, completed, status, deleteTask}: TaskProps) {

    return (
        <li className = {css.completed ? "completed" : ""}>
            <span>{text}</span>
            <button className="delete-btn" onClick={() => deleteTask(id)}>delete</button>
            <span>{status}</span>
            <button>{completed ? "undo" : "do"}</button>
        </li>
    )
}