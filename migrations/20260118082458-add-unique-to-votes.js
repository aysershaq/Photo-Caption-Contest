'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // لو الجدول موجود بالفعل: فقط أضف القيد
    await queryInterface.addConstraint('Votes', {
      fields: ['userId', 'captionId'],
      type: 'unique',
      name: 'uq_votes_userId_captionId', // اسم واضح وثابت للقيد
    });

    // (مهم جدًا) تأكد أيضًا أن الأعمدة NOT NULL + Foreign Keys موجودة
    // إذا لم تكن موجودة، أضفها في Migration منفصلة أو هنا حسب حالتك.
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Votes', 'uq_votes_userId_captionId');
  }
};
