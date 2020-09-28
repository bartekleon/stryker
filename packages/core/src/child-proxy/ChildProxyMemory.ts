import { WorkerMessage } from './messageProtocol';

const ChildProxyMemory = new Map<string, WorkerMessage>();

export default ChildProxyMemory;
