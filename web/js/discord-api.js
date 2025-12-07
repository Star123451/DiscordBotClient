/**
 * Discord REST API Client
 */
class DiscordAPI {
    constructor(token) {
        this.token = token;
        this.baseURL = 'https://discord.com/api/v10';
        this.user = null;
    }

    /**
     * Make an API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Authorization': `Bot ${this.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        const user = await this.request('/users/@me');
        this.user = user;
        return user;
    }

    /**
     * Get user guilds
     */
    async getGuilds() {
        return await this.request('/users/@me/guilds');
    }

    /**
     * Get guild
     */
    async getGuild(guildId) {
        return await this.request(`/guilds/${guildId}`);
    }

    /**
     * Get guild channels
     */
    async getGuildChannels(guildId) {
        return await this.request(`/guilds/${guildId}/channels`);
    }

    /**
     * Get channel
     */
    async getChannel(channelId) {
        return await this.request(`/channels/${channelId}`);
    }

    /**
     * Get channel messages
     */
    async getChannelMessages(channelId, limit = 50) {
        return await this.request(`/channels/${channelId}/messages?limit=${limit}`);
    }

    /**
     * Send message
     */
    async sendMessage(channelId, content, options = {}) {
        const body = {
            content,
            ...options
        };

        return await this.request(`/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    /**
     * Delete message
     */
    async deleteMessage(channelId, messageId) {
        return await this.request(`/channels/${channelId}/messages/${messageId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Edit message
     */
    async editMessage(channelId, messageId, content) {
        return await this.request(`/channels/${channelId}/messages/${messageId}`, {
            method: 'PATCH',
            body: JSON.stringify({ content })
        });
    }

    /**
     * Add reaction
     */
    async addReaction(channelId, messageId, emoji) {
        const encodedEmoji = encodeURIComponent(emoji);
        return await this.request(`/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`, {
            method: 'PUT'
        });
    }

    /**
     * Remove reaction
     */
    async removeReaction(channelId, messageId, emoji) {
        const encodedEmoji = encodeURIComponent(emoji);
        return await this.request(`/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`, {
            method: 'DELETE'
        });
    }

    /**
     * Get guild members
     */
    async getGuildMembers(guildId, limit = 1000) {
        return await this.request(`/guilds/${guildId}/members?limit=${limit}`);
    }

    /**
     * Get guild roles
     */
    async getGuildRoles(guildId) {
        return await this.request(`/guilds/${guildId}/roles`);
    }

    /**
     * Create channel
     */
    async createChannel(guildId, name, type = 0) {
        return await this.request(`/guilds/${guildId}/channels`, {
            method: 'POST',
            body: JSON.stringify({ name, type })
        });
    }

    /**
     * Delete channel
     */
    async deleteChannel(channelId) {
        return await this.request(`/channels/${channelId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Modify channel
     */
    async modifyChannel(channelId, options) {
        return await this.request(`/channels/${channelId}`, {
            method: 'PATCH',
            body: JSON.stringify(options)
        });
    }

    /**
     * Typing indicator
     */
    async triggerTyping(channelId) {
        return await this.request(`/channels/${channelId}/typing`, {
            method: 'POST'
        });
    }

    /**
     * Get DM channels
     */
    async getDMChannels() {
        return await this.request('/users/@me/channels');
    }

    /**
     * Create DM
     */
    async createDM(userId) {
        return await this.request('/users/@me/channels', {
            method: 'POST',
            body: JSON.stringify({ recipient_id: userId })
        });
    }

    /**
     * Get user avatar URL
     */
    getUserAvatarURL(user, size = 128) {
        if (!user.avatar) {
            // Default avatar - use user ID for new username system
            const defaultAvatarNumber = (user.discriminator && user.discriminator !== '0') 
                ? parseInt(user.discriminator) % 5 
                : (parseInt(user.id) >> 22) % 6;
            return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        }
        
        const format = user.avatar.startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=${size}`;
    }

    /**
     * Get guild icon URL
     */
    getGuildIconURL(guild, size = 128) {
        if (!guild.icon) {
            return null;
        }
        
        const format = guild.icon.startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${format}?size=${size}`;
    }

    /**
     * Get attachment URL
     */
    getAttachmentURL(attachment) {
        return attachment.url || attachment.proxy_url;
    }

    /**
     * Format timestamp
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        } else {
            return date.toLocaleString('en-US', { 
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        }
    }

    /**
     * Parse mentions in message content (simplified version)
     */
    parseMentions(content) {
        // User mentions
        content = content.replace(/<@!?(\d+)>/g, '@User');
        
        // Role mentions
        content = content.replace(/<@&(\d+)>/g, '@Role');
        
        // Channel mentions
        content = content.replace(/<#(\d+)>/g, '#channel');
        
        return content;
    }

    /**
     * Get channel type name
     */
    getChannelTypeName(type) {
        const types = {
            0: 'text',
            2: 'voice',
            4: 'category',
            5: 'announcement',
            10: 'announcement_thread',
            11: 'public_thread',
            12: 'private_thread',
            13: 'stage',
            15: 'forum'
        };
        return types[type] || 'unknown';
    }
}
