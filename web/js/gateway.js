/**
 * Discord Gateway WebSocket Client
 */
class DiscordGateway {
    constructor(token) {
        this.token = token;
        this.ws = null;
        this.heartbeatInterval = null;
        this.sessionId = null;
        this.resumeGatewayUrl = null;
        this.sequence = null;
        this.listeners = new Map();
        this.ready = false;
        
        // Gateway intents
        this.intents = (1 << 0) |  // GUILDS
                      (1 << 9) |  // GUILD_MESSAGES
                      (1 << 15);  // MESSAGE_CONTENT
    }

    /**
     * Connect to Gateway
     */
    connect() {
        return new Promise((resolve, reject) => {
            const gatewayUrl = 'wss://gateway.discord.gg/?v=10&encoding=json';
            this.ws = new WebSocket(gatewayUrl);

            this.ws.onopen = () => {
                console.log('Gateway connected');
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.ws.onerror = (error) => {
                console.error('Gateway error:', error);
                this.emit('error', error);
                reject(error);
            };

            this.ws.onclose = (event) => {
                console.log('Gateway closed:', event.code, event.reason);
                this.ready = false;
                this.stopHeartbeat();
                this.emit('disconnected', event);
                
                // Auto-reconnect only on recoverable close codes
                // 4007 (invalid seq), 4008 (rate limited), 4009 (session timeout) require re-auth
                if ([4000, 4001, 4002, 4003, 4005].includes(event.code)) {
                    console.log('Attempting to reconnect...');
                    setTimeout(() => this.connect(), 5000);
                } else if ([4007, 4008, 4009].includes(event.code)) {
                    console.log('Authentication issue - please re-login');
                    this.emit('auth_error', event);
                }
            };

            // Wait for ready event
            this.once('READY', () => {
                this.ready = true;
                resolve();
            });
        });
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        const { op, t, d, s } = data;

        // Update sequence
        if (s !== null) {
            this.sequence = s;
        }

        switch (op) {
            case 0: // Dispatch
                this.handleDispatch(t, d);
                break;
            case 1: // Heartbeat
                this.sendHeartbeat();
                break;
            case 7: // Reconnect
                this.ws.close();
                this.connect();
                break;
            case 9: // Invalid Session
                console.log('Invalid session, reconnecting...');
                setTimeout(() => this.identify(), 2000);
                break;
            case 10: // Hello
                this.handleHello(d);
                break;
            case 11: // Heartbeat ACK
                // Heartbeat acknowledged
                break;
        }
    }

    /**
     * Handle Hello message
     */
    handleHello(data) {
        this.startHeartbeat(data.heartbeat_interval);
        
        if (this.sessionId && this.resumeGatewayUrl) {
            this.resume();
        } else {
            this.identify();
        }
    }

    /**
     * Identify with gateway
     */
    identify() {
        const payload = {
            op: 2,
            d: {
                token: this.token,
                intents: this.intents,
                properties: {
                    os: 'browser',
                    browser: 'discord-bot-client-web',
                    device: 'discord-bot-client-web'
                }
            }
        };

        this.send(payload);
    }

    /**
     * Resume session
     */
    resume() {
        const payload = {
            op: 6,
            d: {
                token: this.token,
                session_id: this.sessionId,
                seq: this.sequence
            }
        };

        this.send(payload);
    }

    /**
     * Start heartbeat
     */
    startHeartbeat(interval) {
        this.stopHeartbeat();
        
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, interval);

        // Send initial heartbeat
        this.sendHeartbeat();
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Send heartbeat
     */
    sendHeartbeat() {
        const payload = {
            op: 1,
            d: this.sequence
        };

        this.send(payload);
    }

    /**
     * Handle dispatch events
     */
    handleDispatch(eventName, data) {
        console.log('Gateway event:', eventName);

        switch (eventName) {
            case 'READY':
                this.sessionId = data.session_id;
                this.resumeGatewayUrl = data.resume_gateway_url;
                break;
            case 'RESUMED':
                console.log('Session resumed');
                break;
        }

        this.emit(eventName, data);
        this.emit('*', eventName, data);
    }

    /**
     * Send data to gateway
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    /**
     * Request guild members
     */
    requestGuildMembers(guildId) {
        const payload = {
            op: 8,
            d: {
                guild_id: guildId,
                query: '',
                limit: 0
            }
        };

        this.send(payload);
    }

    /**
     * Update presence
     */
    updatePresence(status = 'online', activity = null) {
        const payload = {
            op: 3,
            d: {
                since: null,
                activities: activity ? [activity] : [],
                status: status,
                afk: false
            }
        };

        this.send(payload);
    }

    /**
     * Disconnect
     */
    disconnect() {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close(1000, 'User disconnected');
            this.ws = null;
        }
        this.ready = false;
    }

    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    once(event, callback) {
        const onceWrapper = (...args) => {
            callback(...args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, ...args) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error('Event callback error:', error);
                }
            });
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN && this.ready;
    }
}
