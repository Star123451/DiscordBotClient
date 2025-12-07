/**
 * Main Application
 */
class App {
    constructor() {
        this.api = null;
        this.gateway = null;
        this.ui = new UIController();
        this.token = null;
        
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('Discord Bot Client - Web Version');
        
        // Check for saved token
        const savedToken = localStorage.getItem('discord-bot-token');
        if (savedToken) {
            await this.login(savedToken, true);
        } else {
            this.ui.showLogin();
        }
        
        // Setup login form
        this.ui.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = this.ui.tokenInput.value.trim();
            await this.login(token, false);
        });
        
        // Setup message form
        this.ui.messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendMessage();
        });
    }

    /**
     * Login with bot token
     */
    async login(token, autoLogin = false) {
        try {
            this.ui.hideLoginError();
            this.ui.showLoading('Connecting to Discord...');
            
            // Initialize API client
            this.api = new DiscordAPI(token);
            this.token = token;
            
            // Get current user
            const user = await this.api.getCurrentUser();
            console.log('Logged in as:', user.username);
            
            // Verify it's a bot account
            if (!user.bot) {
                throw new Error('This token is not a bot token. Please use a bot token from Discord Developer Portal.');
            }
            
            // Initialize Gateway
            this.gateway = new DiscordGateway(token);
            
            // Setup gateway event listeners
            this.setupGatewayEvents();
            
            // Connect to gateway
            this.ui.updateConnectionStatus('connecting');
            await this.gateway.connect();
            
            // Get guilds (Gateway will provide GUILD_CREATE events)
            const guilds = await this.api.getGuilds();
            console.log('Loaded guilds:', guilds.length);
            
            // Update UI
            this.ui.setUserInfo(user);
            this.ui.renderGuilds(guilds);
            this.ui.updateConnectionStatus('connected');
            this.ui.showApp();
            this.ui.hideLoading();
            
            // Save token if not auto-login
            if (!autoLogin) {
                localStorage.setItem('discord-bot-token', token);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.ui.hideLoading();
            
            if (autoLogin) {
                // Clear invalid saved token
                localStorage.removeItem('discord-bot-token');
                this.ui.showLogin();
            } else {
                this.ui.showLoginError(error.message);
            }
        }
    }

    /**
     * Setup gateway event listeners
     */
    setupGatewayEvents() {
        // Connection events
        this.gateway.on('connected', () => {
            console.log('Gateway connected');
            this.ui.updateConnectionStatus('connecting');
        });
        
        this.gateway.on('disconnected', () => {
            console.log('Gateway disconnected');
            this.ui.updateConnectionStatus('disconnected');
        });
        
        this.gateway.on('auth_error', (event) => {
            console.error('Authentication error:', event.code, event.reason);
            alert('Authentication error. Please re-login with a valid bot token.');
            this.ui.logout();
        });
        
        // Ready event
        this.gateway.on('READY', (data) => {
            console.log('Gateway ready:', data.user.username);
            this.ui.updateConnectionStatus('connected');
        });
        
        // Message events
        this.gateway.on('MESSAGE_CREATE', (message) => {
            this.handleNewMessage(message);
        });
        
        this.gateway.on('MESSAGE_UPDATE', (message) => {
            this.handleMessageUpdate(message);
        });
        
        this.gateway.on('MESSAGE_DELETE', (data) => {
            this.handleMessageDelete(data);
        });
        
        // Guild events
        this.gateway.on('GUILD_CREATE', (guild) => {
            console.log('Guild available:', guild.name);
        });
        
        // Channel events
        this.gateway.on('CHANNEL_CREATE', (channel) => {
            console.log('Channel created:', channel.name);
            // Reload channels if we're in this guild
            if (this.ui.currentGuild && channel.guild_id === this.ui.currentGuild.id) {
                this.reloadChannels();
            }
        });
        
        this.gateway.on('CHANNEL_DELETE', (channel) => {
            console.log('Channel deleted:', channel.id);
            // Reload channels if we're in this guild
            if (this.ui.currentGuild && channel.guild_id === this.ui.currentGuild.id) {
                this.reloadChannels();
            }
        });
    }

    /**
     * Handle new message
     */
    handleNewMessage(message) {
        console.log('New message:', message.author.username, message.content);
        this.ui.addMessage(message);
    }

    /**
     * Handle message update
     */
    handleMessageUpdate(message) {
        console.log('Message updated:', message.id);
        // Could implement message editing UI here
    }

    /**
     * Handle message delete
     */
    handleMessageDelete(data) {
        console.log('Message deleted:', data.id);
        // Could remove message from UI here
        const messageElement = document.querySelector(`[data-message-id="${data.id}"]`);
        if (messageElement) {
            messageElement.style.opacity = '0.5';
            messageElement.querySelector('.message-text').textContent = '[Message deleted]';
        }
    }

    /**
     * Send message
     */
    async sendMessage() {
        if (!this.ui.currentChannel) return;
        
        const content = this.ui.messageInput.value.trim();
        if (!content) return;
        
        try {
            // Disable input
            this.ui.messageInput.disabled = true;
            
            // Send message
            const message = await this.api.sendMessage(this.ui.currentChannel.id, content);
            console.log('Message sent:', message.id);
            
            // Clear input
            this.ui.messageInput.value = '';
            
            // Message will be added via gateway event
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message: ' + error.message);
        } finally {
            this.ui.messageInput.disabled = false;
            this.ui.messageInput.focus();
        }
    }

    /**
     * Reload channels for current guild
     */
    async reloadChannels() {
        if (!this.ui.currentGuild) return;
        
        try {
            const channels = await this.api.getGuildChannels(this.ui.currentGuild.id);
            this.ui.renderChannels(channels);
        } catch (error) {
            console.error('Error reloading channels:', error);
        }
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new App();
    });
} else {
    app = new App();
}
