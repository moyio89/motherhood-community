const emailTemplates = {
  subscriptionConfirmation: (userName: string) => `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>تأكيد الاشتراك</title>
  </head>
  <body>
  <p>عزيزي ${userName}،</p>
  <p>تم تفعيل اشتراكك بنجاح في مجتمع الدعم التربوي. نأمل أن تستمتع بالخدمات والمزايا التي نقدمها.</p>
  </body>
  </html>
 `,
  newSubscriptionAdminAlert: (userName: string, userEmail: string) => `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>تنبيه اشتراك جديد</title>
  </head>
  <body>
  <p>تم تسجيل اشتراك جديد في مجتمع الدعم التربوي.</p>
  <p>اسم المستخدم: ${userName}</p>
  <p>البريد الإلكتروني: ${userEmail}</p>
  </body>
  </html>
 `,
  newTopicAlert: (topicTitle: string, topicUrl: string) => `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>موضوع جديد في مجتمع الدعم التربوي</title>
  </head>
  <body>
  <p>تم نشر موضوع جديد بعنوان: ${topicTitle}</p>
  <p>يمكنك الاطلاع على الموضوع من خلال الرابط التالي: <a href="${topicUrl}">${topicUrl}</a></p>
  </body>
  </html>
 `,
  newQuestionAlert: (questionTitle: string, questionUrl: string) => `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>سؤال جديد في مجتمع الدعم التربوي</title>
  </head>
  <body>
  <p>تم طرح سؤال جديد بعنوان: ${questionTitle}</p>
  <p>يمكنك الاطلاع على السؤال من خلال الرابط التالي: <a href="${questionUrl}">${questionUrl}</a></p>
  </body>
  </html>
 `,
  newCommentAlert: (topicTitle: string, commentUrl: string) => `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>تعليق جديد على موضوعك</title>
  </head>
  <body>
  <p>تم إضافة تعليق جديد على موضوع "${topicTitle}".</p>
  <p>يمكنك الاطلاع على التعليق من خلال الرابط التالي: <a href="${commentUrl}">${commentUrl}</a></p>
  </body>
  </html>
 `,
}

export { emailTemplates }
