#!/usr/bin/env node

import { chromium } from 'playwright';
import express from 'express';
import path from 'path';

class PlaywrightMCP {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.app = express();
    this.port = 3001;
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    
    this.app.get('/status', (req, res) => {
      res.json({ 
        status: 'running',
        browser: this.browser ? 'connected' : 'disconnected',
        page: this.page ? 'active' : 'inactive'
      });
    });

    this.app.post('/launch', async (req, res) => {
      try {
        await this.launchBrowser();
        res.json({ success: true, message: 'Browser launched successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/navigate', async (req, res) => {
      try {
        const { url } = req.body;
        if (!this.page) {
          await this.launchBrowser();
        }
        await this.page.goto(url);
        res.json({ success: true, message: `Navigated to ${url}` });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/click', async (req, res) => {
      try {
        const { selector } = req.body;
        await this.page.click(selector);
        res.json({ success: true, message: `Clicked ${selector}` });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/type', async (req, res) => {
      try {
        const { selector, text } = req.body;
        await this.page.fill(selector, text);
        res.json({ success: true, message: `Typed "${text}" into ${selector}` });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/screenshot', async (req, res) => {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        res.json({ 
          success: true, 
          screenshot: screenshot.toString('base64'),
          message: 'Screenshot taken'
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/close', async (req, res) => {
      try {
        await this.closeBrowser();
        res.json({ success: true, message: 'Browser closed' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async launchBrowser() {
    if (this.browser) {
      await this.closeBrowser();
    }

    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
    
    console.log('🚀 Browser launched successfully');
  }

  async closeBrowser() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    console.log('🔴 Browser closed');
  }

  async start() {
    try {
      this.server = this.app.listen(this.port, () => {
        console.log(`🎭 Playwright MCP Server running on port ${this.port}`);
        console.log(`📊 Status: http://localhost:${this.port}/status`);
      });

      // Auto-launch browser and open project
      await this.launchBrowser();
      
      // Navigate to local development server
      const projectUrl = 'http://localhost:8088'; // Project's actual port
      console.log(`🌐 Opening project at ${projectUrl}`);
      await this.page.goto(projectUrl);
      
    } catch (error) {
      console.error('❌ Failed to start Playwright MCP:', error);
      process.exit(1);
    }
  }

  async stop() {
    await this.closeBrowser();
    if (this.server) {
      this.server.close();
    }
    console.log('🛑 Playwright MCP Server stopped');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Playwright MCP...');
  if (global.playwrightMCP) {
    await global.playwrightMCP.stop();
  }
  process.exit(0);
});

// Start the server
const playwrightMCP = new PlaywrightMCP();
global.playwrightMCP = playwrightMCP;
playwrightMCP.start();
