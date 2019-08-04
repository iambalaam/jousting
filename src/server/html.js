const html = () => `
<!DOCTYPE html>
<html>

<meta charset="UTF-8">

<head>
    <title>Joust</title>
    <link rel="stylesheet" href="/lib/index.css">
    <script src="/lib/p5.min.js"></script>
    <script src="/lib/p5.play.js" type="text/javascript"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/lib/index.js" type="text/javascript"></script>
</head>

<body>
    <noscript>You will need JavaScript to play this game.</noscript>
    <main></main>
</body>

</html>
`;

module.exports = {
    html
};