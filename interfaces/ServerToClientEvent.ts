export default interface ServerToClientEvent {
    serverMsg: (
        data: {
            msg: string, 
            room: string
        }
    ) => void;
}