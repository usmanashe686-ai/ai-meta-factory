// Temporary fix for build - will restore full functions later
export async function getUserReview(userId: string, templateId: string): Promise<any> {
  console.log(`Getting review for user ${userId}, template ${templateId}`);
  return null;
}

export async function updateTemplateRating(templateId: string): Promise<void> {
  console.log(`Updating rating for template ${templateId}`);
  return Promise.resolve();
}
