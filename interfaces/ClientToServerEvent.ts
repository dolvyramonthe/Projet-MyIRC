export default interface ClientToServerEvent {
    clientMsg: (
        data: {
            msg: string, 
            room: string
        }
    ) => void;
}