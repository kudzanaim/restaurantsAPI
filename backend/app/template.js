const template = {
    container:(restaurantList, header)=>`
        <h1 style="font-family:monospace; text-align:center">${header}</h1>
        <div style="width: max-content;margin: 0 auto;display: grid;grid-template-columns: 250px 250px">
            ${restaurantList}
        </div>
    `,
    item:(restaurant, distance)=>`
        <div id="rede" onMouseOver="this.style.background='#ececec'" onMouseOut="this.style.background='#fbfbfb'" style="font-family: monospace;margin-bottom: 30px;border-bottom: solid 1px #8a8787;padding: 10px;color: #5a5a5a;margin-right: 10%;background: #fbfbfb;">
            <h3 style="margin:5px 0;">${restaurant.name}</h3>
            <div style="color: #3c3c3c;">Time: ${(parseInt(restaurant.openTime)<10)? '0'+restaurant.openTime : restaurant.openTime}00hrs - ${(parseInt(restaurant.closeTime)<10)? '0'+restaurant.closeTime : restaurant.closeTime}00hrs</div>
            <div style="color: #3c3c3c;">City: ${restaurant.city}</div>
            <div style="color: #3c3c3c;">Post Code: ${restaurant.postCode}</div>
            <div style="font-size: 11px;margin-top: 4px;color: #c700af;"><i>${Math.round(distance)} miles away</i></div>
            <div  style="color: #060505;margin-top: 5px;font-size: 10px;background: #c1c1c1;width: max-content;padding: 3px 5px;">ID: ${restaurant.id}</div>
        </div>
    `,
    blacklistFavourite:(restaurant_name, type)=>`
        <div style="width:100%; padding-top:150px; text-align:center">
            <h1 style="font-size:40px; font-family:monospace"><span style="color:blue">${restaurant_name}</span> was successfully ${type}!</h1>
        </div>
    `
}

module.exports = template;