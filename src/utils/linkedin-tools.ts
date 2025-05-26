import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { getJson } from 'serpapi';
import { z } from 'zod';

import { DynamicStructuredTool } from '@langchain/core/tools';

interface LinkedInProfile {
  name: string;
  title: string;
  company: string;
  location: string;
  profile_url: string;
  snippet?: string;
}

export const linkedInSearchTool = new DynamicStructuredTool({
  name: 'linkedin_profile_search',
  description: 'Search LinkedIn profiles based on specific criteria like job title, company, skills, or location',
  schema: z.object({
    query: z.string().describe("Search query to find LinkedIn profiles (e.g. 'React developer Paris', 'CEO startup')"),
    location: z.string().optional().describe('Geographic location to filter results'),
    num_results: z.number().optional().default(10).describe('Number of results to return (max 20)')
  }),
  func: async ({ query, location, num_results = 10 }) => {
    try {
      const searchQuery = location ? `${query} ${location} site:linkedin.com/in` : `${query} site:linkedin.com/in`;
      console.log('Search query:', searchQuery);
      console.log('Location:', location);
      console.log('Num results:', num_results);

      const response = await getJson({
        engine: 'google',
        q: searchQuery,
        api_key: process.env.SERP_API_KEY,
        num: Math.min(num_results, 20)
      });

      const profiles: LinkedInProfile[] = [];

      if (response.organic_results) {
        for (const result of response.organic_results) {
          if (result.link && result.link.includes('linkedin.com/in/')) {
            const titleMatch = result.title?.match(/^([^-|]+)/);
            const companyMatch = result.snippet?.match(/chez ([^.|]+)/i) || result.snippet?.match(/at ([^.|]+)/i);

            profiles.push({
              name: titleMatch ? titleMatch[1].trim() : result.title || 'Nom non disponible',
              title: result.title || 'Titre non disponible',
              company: companyMatch ? companyMatch[1].trim() : 'Entreprise non disponible',
              location: location || 'Localisation non spécifiée',
              profile_url: result.link,
              snippet: result.snippet
            });
          }
        }
      }

      return JSON.stringify({
        query: searchQuery,
        total_found: profiles.length,
        profiles: profiles
      });
    } catch (error) {
      console.error('Erreur lors de la recherche LinkedIn:', error);

      return JSON.stringify({
        error: 'Erreur lors de la recherche de profils LinkedIn',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
});

export const googleSheetsWriteTool = new DynamicStructuredTool({
  name: 'google_sheets_write',
  description: 'Save LinkedIn profiles found in a Google Sheet',
  schema: z.object({
    profiles: z
      .array(
        z.object({
          name: z.string(),
          title: z.string(),
          company: z.string(),
          location: z.string(),
          profile_url: z.string(),
          snippet: z.string().optional()
        })
      )
      .describe('List of LinkedIn profiles to save'),
    search_query: z.string().describe('Original search query used to find profiles'),
    sheet_name: z.string().optional().describe('Optional custom sheet name')
  }),
  func: async ({ profiles, search_query, sheet_name, ...rest }) => {
    try {
      console.log('Start of Google Sheets save...');
      console.log('Profiles to save:', profiles.length);
      console.log('Search query:', search_query);
      console.log('Sheet name:', sheet_name);
      console.log('Rest:', rest);

      const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
      const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

      if (!clientEmail || !privateKey || !spreadsheetId) {
        throw new Error(
          `Variables manquantes: ${!clientEmail ? 'CLIENT_EMAIL ' : ''}${!privateKey ? 'PRIVATE_KEY ' : ''}${!spreadsheetId ? 'SPREADSHEET_ID' : ''}`
        );
      }

      console.log('Authentication configuration...');
      const auth = new GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      const sheets = google.sheets({ version: 'v4', auth });

      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('fr-FR').replace(/\//g, '-');
      const timeStr = currentDate.toLocaleTimeString('fr-FR').replace(/:/g, '-');
      const searchTermForSheet = search_query
        .slice(0, 20)
        .replace(/[^\w\s-]/g, '')
        .trim();
      const generatedSheetName = sheet_name || `${searchTermForSheet}_${dateStr}_${timeStr}`;

      console.log('Creating new sheet:', generatedSheetName);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: generatedSheetName
                }
              }
            }
          ]
        }
      });

      console.log('Preparing data...');
      const headers = [
        'Nom',
        'Titre',
        'Entreprise',
        'Localisation',
        'URL Profil',
        'Description',
        'Date Ajout',
        'Recherche'
      ];
      const values = [
        headers,
        ...profiles.map((profile) => [
          profile.name,
          profile.title,
          profile.company,
          profile.location,
          profile.profile_url,
          profile.snippet || '',
          currentDate.toLocaleDateString('fr-FR'),
          search_query
        ])
      ];

      console.log('Writing in progress');
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${generatedSheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });

      console.log('Save OK');

      return JSON.stringify({
        success: true,
        message: `${profiles.length} profils sauvegardés avec succès dans le nouvel onglet "${generatedSheetName}"`,
        spreadsheet_url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sheet_name: generatedSheetName,
        updated_cells: response.data.updatedCells
      });
    } catch (error) {
      console.error("Erreur lors de l'écriture dans Google Sheets:", error);

      return JSON.stringify({
        error: 'Erreur lors de la sauvegarde dans Google Sheets',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
});

export const linkedInTools = [linkedInSearchTool, googleSheetsWriteTool];
