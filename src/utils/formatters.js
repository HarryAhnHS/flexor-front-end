import { format, formatDistanceToNow } from "date-fns";

export const formatTime = (dt) => {
    return formatDistanceToNow(new Date(dt), { addSuffix: true });
};

export const formatTimeNoSuffix = (dt) => {
    return formatDistanceToNow(new Date(dt), { addSuffix: false });
};

export const formatDate = (dt) => {
    return format(new Date(dt),'MM/dd/yyyy');
};