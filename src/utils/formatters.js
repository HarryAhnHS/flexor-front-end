import { format, formatDistanceToNow } from "date-fns";

export const formatTime = (dt) => {
    return formatDistanceToNow(new Date(dt), { addSuffix: true });
};

export const formatDate = (dt) => {
    return format(new Date(dt),'MM/dd/yyyy');
};