export function buildUserMessageFromFields(
  fieldResponses: Record<string, string>,
) {
  return JSON.stringify(fieldResponses);
}
