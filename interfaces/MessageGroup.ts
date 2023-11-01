export default interface Message {
    id: number,
    content: string,
    senderId: number,
    receiversId: number[]
}