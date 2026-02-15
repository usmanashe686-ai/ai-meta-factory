import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3004';
const PROJECT_ID = 'test-project-' + Date.now();

interface User {
  id: string;
  name: string;
  color?: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

class TestClient {
  private socket: Socket | null = null;
  private userId: string = '';
  public name: string;
  public receivedUsers: any[] = [];
  public receivedMessages: Message[] = [];
  public receivedCursors: any[] = [];
  public receivedCodeChanges: any[] = [];
  public joined = false;
  private connectedPromise: Promise<void>;
  private resolveConnected!: () => void;

  constructor(name: string) {
    this.name = name;
    this.connectedPromise = new Promise((resolve) => {
      this.resolveConnected = resolve;
    });
    this.connect();
  }

  private connect() {
    this.socket = io(SERVER_URL);

    this.socket.on('connect', () => {
      if (!this.socket) return;
      console.log(`[${this.name}] Connected with id ${this.socket.id}`);
      this.userId = this.socket.id as string;
      this.resolveConnected();
    });

    this.socket.on('user-list', (users: any[]) => {
      console.log(`[${this.name}] Received user list:`, users.map(u => u.name));
      this.receivedUsers = users;
    });

    this.socket.on('user-joined', (user: any) => {
      console.log(`[${this.name}] User joined: ${user.name}`);
      this.receivedUsers.push(user);
    });

    this.socket.on('user-left', (userId: string) => {
      console.log(`[${this.name}] User left: ${userId}`);
      this.receivedUsers = this.receivedUsers.filter(u => u.id !== userId);
    });

    this.socket.on('new-message', (msg: Message) => {
      console.log(`[${this.name}] New message from ${msg.userName}: ${msg.content}`);
      this.receivedMessages.push(msg);
    });

    this.socket.on('cursor-updated', ({ userId, cursor }: any) => {
      console.log(`[${this.name}] Cursor update from ${userId}:`, cursor);
      this.receivedCursors.push({ userId, cursor });
    });

    this.socket.on('code-changed', ({ file, content, userId }: any) => {
      console.log(`[${this.name}] Code change from ${userId} in ${file}`);
      this.receivedCodeChanges.push({ file, content, userId });
    });
  }

  async joinProject() {
    await this.connectedPromise;
    if (!this.socket) return;
    this.socket.emit('join-project', {
      projectId: PROJECT_ID,
      user: { name: this.name, color: '#' + Math.floor(Math.random()*16777215).toString(16) }
    });
    this.joined = true;
  }

  async sendMessage(content: string) {
    await this.connectedPromise;
    if (!this.socket) return;
    this.socket.emit('send-message', {
      projectId: PROJECT_ID,
      userId: this.userId,
      userName: this.name,
      content
    });
  }

  async updateCursor(line: number, column: number, file: string) {
    await this.connectedPromise;
    if (!this.socket) return;
    this.socket.emit('cursor-update', { line, column, file });
  }

  async sendCodeChange(file: string, content: string) {
    await this.connectedPromise;
    if (!this.socket) return;
    this.socket.emit('code-change', { file, content });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }

  wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function runTest() {
  console.log('🚀 Starting collaboration test...\n');

  const client1 = new TestClient('Alice');
  const client2 = new TestClient('Bob');
  const client3 = new TestClient('Charlie');

  // Wait for connections
  await client1.wait(1000);
  await client2.wait(1000);
  await client3.wait(1000);

  // All join project
  console.log('\n--- Joining project ---');
  await client1.joinProject();
  await client1.wait(500);
  await client2.joinProject();
  await client2.wait(500);
  await client3.joinProject();
  await client3.wait(1000);

  // Check that all clients see each other
  console.log('\n--- Checking user lists ---');
  console.log(`Client1 sees: ${client1.receivedUsers.map(u => u.name).join(', ')}`);
  console.log(`Client2 sees: ${client2.receivedUsers.map(u => u.name).join(', ')}`);
  console.log(`Client3 sees: ${client3.receivedUsers.map(u => u.name).join(', ')}`);

  // Test chat
  console.log('\n--- Testing chat ---');
  await client1.sendMessage('Hello everyone!');
  await client1.wait(500);
  await client2.sendMessage('Hi Alice!');
  await client2.wait(500);
  await client3.sendMessage('Hey folks!');
  await client3.wait(500);

  console.log(`Client1 messages received: ${client1.receivedMessages.length}`);
  console.log(`Client2 messages received: ${client2.receivedMessages.length}`);
  console.log(`Client3 messages received: ${client3.receivedMessages.length}`);

  // Test cursors
  console.log('\n--- Testing cursors ---');
  await client1.updateCursor(10, 5, 'index.js');
  await client1.wait(200);
  await client2.updateCursor(20, 3, 'style.css');
  await client2.wait(200);
  await client3.updateCursor(5, 10, 'index.js');
  await client3.wait(500);

  console.log(`Cursor updates received by client1: ${client1.receivedCursors.length}`);
  console.log(`Cursor updates received by client2: ${client2.receivedCursors.length}`);
  console.log(`Cursor updates received by client3: ${client3.receivedCursors.length}`);

  // Test code changes
  console.log('\n--- Testing code changes ---');
  await client1.sendCodeChange('index.js', 'console.log("Hello");');
  await client1.wait(200);
  await client2.sendCodeChange('style.css', 'body { color: red; }');
  await client2.wait(200);
  await client3.sendCodeChange('index.js', 'const x = 5;');
  await client3.wait(500);

  console.log(`Code changes received by client1: ${client1.receivedCodeChanges.length}`);
  console.log(`Code changes received by client2: ${client2.receivedCodeChanges.length}`);
  console.log(`Code changes received by client3: ${client3.receivedCodeChanges.length}`);

  // Cleanup
  client1.disconnect();
  client2.disconnect();
  client3.disconnect();

  console.log('\n✅ Test completed.');
}

runTest().catch(console.error);
