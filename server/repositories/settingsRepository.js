const Settings = require('../models/Settings');

/**
 * Settings Repository - Centralizes database queries for system configurations.
 */
class SettingsRepository {
  /**
   * Fetch the configuration settings document or create a default one if none exists.
   */
  async findOrCreate() {
    let settings = await Settings.findOne({});
    if (!settings) {
      // Create defaults
      settings = await Settings.create({
        fee: {
          receiptPrefix: 'RCP',
          gstRate: 18,
          paymentTerms: 'Due upon receipt',
          allowInstallments: true,
          lateFeeGracePeriodDays: 5,
          lateFeeDailyAmount: 100
        }
      });
    }
    return settings;
  }

  /**
   * Update the settings configuration document.
   * @param {Object} updateData - Target update key-values.
   */
  async update(updateData) {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await this.findOrCreate();
    }
    
    // Update fields
    if (updateData.fee) {
      settings.fee = {
        ...settings.fee,
        ...updateData.fee
      };
    }
    
    return await settings.save();
  }

  /**
   * Reset the configuration settings to factory defaults.
   */
  async reset() {
    await Settings.deleteMany({});
    return await this.findOrCreate();
  }
}

module.exports = new SettingsRepository();
