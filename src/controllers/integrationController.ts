import { Request, Response } from 'express';
import { supabase } from '../services/database-mock';
import { AuthRequest } from '../middleware/auth';

export const connectIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const { provider, authToken, refreshToken } = req.body;
    const userId = req.user?.id;

    if (!provider || !authToken) {
      return res.status(400).json({ error: 'Provider and authToken are required' });
    }

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (existingIntegration) {
      // Update existing integration
      const { data, error } = await supabase
        .from('integrations')
        .update({
          access_token: authToken,
          refresh_token: refreshToken,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingIntegration.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update integration' });
      }

      return res.json({
        message: 'Integration updated successfully',
        integration: data
      });
    }

    // Create new integration
    const { data, error } = await supabase
      .from('integrations')
      .insert([{
        user_id: userId,
        provider,
        access_token: authToken,
        refresh_token: refreshToken,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Integration creation error:', error);
      return res.status(500).json({ error: 'Failed to create integration' });
    }

    res.status(201).json({
      message: 'Integration connected successfully',
      integration: data
    });
  } catch (error) {
    console.error('Integration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIntegrations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('id, provider, is_active, created_at, updated_at')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch integrations' });
    }

    res.json({ integrations });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const disconnectIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const { integrationId } = req.params;
    const userId = req.user?.id;

    const { error } = await supabase
      .from('integrations')
      .update({ is_active: false })
      .eq('id', integrationId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to disconnect integration' });
    }

    res.json({ message: 'Integration disconnected successfully' });
  } catch (error) {
    console.error('Disconnect integration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};