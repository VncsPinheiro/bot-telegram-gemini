async function testarGeracao() {
  const API_KEY = "pLXNJPs8RtWDFAzOf4wjeY2t8ATBdZNX";
  const URL = "https://api.deepinfra.com/v1/inference/stabilityai/sdxl-turbo";

  console.log("Gerando imagem... aguarde.");

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: "A realistic cute cat wearing a space helmet",
      })
    });

    const data: any = await response.json();

    if (data.output && data.output[0]) {
      console.log("Sucesso! URL da imagem:");
      console.log(data.output[0]); // Esta URL você joga no replyWithPhoto
    } else {
      console.log("Erro na API:", data);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

testarGeracao();