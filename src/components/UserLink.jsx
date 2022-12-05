import { Link } from "react-router-dom";
import { HiOutlineUserCircle } from "react-icons/hi";

export default function UserLink(props) {
    return (
        <Link to={`/users/${props.id}`}>
            <div className="flex">
                <div>
                    <HiOutlineUserCircle />
                </div>
                <p>{props.name}</p>
            </div>
        </Link>
    );
}
