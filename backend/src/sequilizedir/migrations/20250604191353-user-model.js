'use strict';
const { values } = require('lodash');

const ProvidersEnum = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
  MICROSOFT: 'azure',
};

const ASLLevelEnum = {
  BEGINNER_1: 'Beginner 1',
  BEGINNER_2: 'Beginner 2',
  BEGINNER_3: 'Beginner 3',
};

const language = {
  es: 'spanish',
  en: 'english',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'users',
        {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
          email: { type: Sequelize.STRING, allowNull: false, unique: true },
          first_name: { type: Sequelize.STRING, allowNull: true },
          last_name: { type: Sequelize.STRING, allowNull: true },
          sub: { type: Sequelize.STRING, allowNull: false },
          provider_type: { type: Sequelize.ENUM({ values: values(ProvidersEnum) }), allowNull: false },
          profile_image: { type: Sequelize.STRING, allowNull: true },
          bio: { type: Sequelize.TEXT, allowNull: true },
          asl_level: { type: Sequelize.ENUM({ values: values(ASLLevelEnum) }), allowNull: true },
          video_link: { type: Sequelize.STRING, allowNull: true },
          secret_MFA: { type: Sequelize.STRING, allowNull: true },
          is_MFA_enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
          factorId_MFA: { type: Sequelize.STRING, allowNull: true },
          status: { type: Sequelize.BOOLEAN },
          preferred_language: { type: Sequelize.ENUM({ values: values(language) }), allowNull: true },
          phone_number: { type: Sequelize.STRING, allowNull: true },
          created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          updated_at: { type: Sequelize.DATE, allowNull: false },
          deleted_at: { type: Sequelize.DATE },
        },
        { transaction: t }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('users', { transaction: t, cascade: true });
    });
  },
};
