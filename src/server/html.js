const html = () => `
<!DOCTYPE html>
<html>

<meta charset="UTF-8">

<head>
    <title>Joust</title>
</head>

<body>
    <noscript>You will need JavaScript to play this game.</noscript>
    <main></main>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/lib/index.js" type="text/javascript"></script>
</body>

</html>
`;

module.exports = {
    html
};