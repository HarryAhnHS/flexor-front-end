import { formatDistanceToNow } from "date-fns";

export const formatTime = (dt) => {
    return formatDistanceToNow(new Date(dt), { addSuffix: true });
};