import { StoreFrontItemInfo } from '@src/valornt-api/util/store-front-parser';

export const createHtmlWithStoreFrontItems = (items: StoreFrontItemInfo[]) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ValoStoreBot</title>
    <style>
    :root{
            --body-width: 740px;
            --body-height: 400px;
            --grid-width: 360px;
            --skin-bg-height: 170px;
            --skin-bg-width: 340px; /* Skin bg ratio 2:1 (width: height) */
            --text-margin: 8px;
            --text-price-margin: 10px;
        }
        * {
            /* margin: 0; */
            padding: 0;
            box-sizing: border-box;
            font-family: sans-serif;
        }
        body{
            width: var(--body-width);
            height: var(--body-height);
        }
        .skins-container {
            width: var(--body-width);
            height: var(--body-height);
            padding: 9px 0;
            background-color: rgb(0, 0, 0);
            display: grid;
            grid-template-columns: var(--grid-width) var(--grid-width);
            justify-content: center;
        }
        .skin-wrapper {
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: fit-content;
            padding: 0px;
            overflow: hidden;
        }
        .skin-bg {
            background-color: rgb(29 29 29);
            overflow: hidden;
            height: var(--skin-bg-height);
            border-radius: 5px;
            position: relative;
            width: var(--skin-bg-width);
            max-width: var(--skin-bg-width);
        }
        .skin-image {
            max-height: 125px;
            margin-top: 50%;
            margin-left: 50%;
            transform: translate(-54%, -116%) rotate(27deg);
            opacity: 0.9;
            z-index: 200;
        }
        .skin-image.knife {
            transform: translate(-51%, -126%) rotate(45deg);
        }
        .skin-text {
            font-weight: 700;
            font-style: italic;
            color: rgb(231, 229, 229);
            font-size: 16px;
            text-transform: uppercase;
        }
        .skin-text.skin-title.over {
            z-index: 9999;
        }
        .skin-text.skin-title.bg {
            position: absolute;
            padding: 2px;
            font-size: 75px;
            color: rgb(255 255 255 / 5%);
        }
        .skin-text.skin-title{
            position: absolute;
            left: 5px;
            bottom: 5px;
            padding: 2px;
            border-radius: 5px;
            font-size: 20px;
            color: rgba(255, 255, 255, 0.911);
            word-break: keep-all;
        }
        .skin-text.skin-price {
            position: absolute;
            right: var(--text-price-margin);
            top: var(--text-price-margin);
            padding-right: 4px;
            font-weight: 100;
            font-style: normal;
            display: inline-flex;
            background-color: rgb(0 0 0 / 36%);
            padding: 4px;
            border-radius: 2px;
            z-index: 1;
        }
        .skin-price-text{
            padding-left: 7px; 
            margin-top: auto; 
            margin-bottom: auto; 
            font-size: 16px;
            opacity: 0.85;
        }
        .price-tier-img {
            display: grid;
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .content-tier{
            align-self: center;
            width: 20px;
        }
    </style>
</head>
<body>
    <div class="skins-container">
    ${items
      .map(
        (item) => `
    <div class="skin-wrapper">
      <div class="skin-bg">
        <div class="skin-text skin-price">
        <div class="content-tier">
          <img src="https://media.valorant-api.com/contenttiers/${item.tierID.toLowerCase()}/displayicon.png"
              class="price-tier-img">
        </div>
          <span class="skin-price-text">${item.vp.toLocaleString()} VP</span>
        </div>
        <div class="skin-text skin-title over">${item.itemName.ko}</div>
        <div class="skin-text skin-title bg">${item.itemName.en}</div>
        <img src="https://media.valorant-api.com/weaponskinlevels/${item.itemID.toLowerCase()}/displayicon.png"
            class="skin-image ${item.vp > 3000 ? 'knife' : ''}" />
      </div>
    </div>`,
      )
      .join('')}
    </div>
</body>
</html>`;
