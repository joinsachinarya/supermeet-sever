const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json);
app.get('/', (req, res)=>{
    res.send("")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});