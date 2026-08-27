export const generateOrderNumber = () => {
  const timestamp =
    Date.now().toString();

  const random =
    Math.floor(
      1000 + Math.random() * 9000
    );

  return `MYNRAL-${timestamp}-${random}`;
};