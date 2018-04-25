window.showrig = 1;
window.showarmy = 0;

game = [];

game.default_gas_price = web3.toHex(1000000000);

game.debug = 1; // TRUE DEBUG!

game.user_address = "";


game.optimalsavetime = 3600;
game.optimalclaim = 86400;
game.lastupdate = 0;
game.prodPerSec = 0;
game.balance = 0;
game.ethbalance = 0;
game.sincedbalance = 0;
game.futurebalance = 0;
game.unconfirmedbalance = 0;
game.time = 0;
game.current_unixtime = 0;
game.nextjackpot = 0;
game.console_output = [];

game.rigdetails = 0;
game.rigpart = [];
game.upgrades = [];

game.totalminer = 0;
game.networkpot = "";
game.networkpot_share = 0;
game.networkhodl = 0;
game.networkhash = 0;
game.unclaimedPot = 0;
game.jackpot = 0;
game._nextDistributionTime = 0;

// BOOSTER
game.hasbooster = false;
game.boosterprice = 0;

// PVP
game.attackpower = 0;
game.defensepower = 0;
game.immunityTime = 0;
game.exhaustTime = 0;

game.attacker = [];

game.countdownimmune = "";
game.countdownexhaust = "";
game.leaderboard = [];

window.windowage = 0;
first_update = 0;



// LOAD GAME!

function minerdata (error, result)
{
        if(!error)
        {
            /* (uint money, uint lastupdate, uint prodPerSec, uint[9] rigs, uint[3] upgrades, uint unclaimedPot, uint lastPot, bool hasBooster, uint unconfirmedMoney) */
            game.balance = result[0].toNumber()+1;  // Add +1 To avoid start game stuck!
            game.sincedbalance = game.balance;
            game.lastupdate = result[1].toNumber();
            game.prodPerSec = result[2].toNumber();
            game.rigdetails = result[3].toString();
            game.upgrades = result[4].toString();
            game.unclaimedPot = web3.fromWei(result[5],'ether');

          //  game.unused = result[6].toString();
            game.hasbooster = result[7].toString();
            game.unconfirmedbalance = result[8].toNumber();

            for (let index = 0; index < result.length; index++) {
              console.log('Minerdata - Index: '+index+" Value: "+result[index].toString());
              }  
        } 
        else
        {
            console.log(error);
        }
};





function pvpdata (error, result)
{
        if(!error)
        {
          /*  GetPVPData(address addr) public constant returns (uint attackpower, uint defensepower, uint immunityTime, uint exhaustTime,
                uint[3] attacker, uint[3] defender)*/

                game.attackpower = result[0].toNumber();
                game.defensepower = result[1].toNumber();
                game.immunityTime = result[2].toNumber();
                game.exhaustTime = result[3].toNumber();

                let attacker = result[4].toString()
                game.attacker = attacker.split(",");

            for (let index = 0; index < result.length; index++) {
              console.log('PVP Data - Index: '+index+" Value: "+result[index].toString());
              }  
        } 
        else
        {
            console.log(error);
        }
};




function plotdata (error, result) // NETWORK ETH
{
        if(!error)
        {   
           /* GetPotInfo() public constant returns (uint _honeyPotAmount, uint _devFunds, uint _jaskPot, uint _nextDistributionTime)*/
            game.networkpot =  web3.fromWei(result[0],'ether');   
            game.nextjackpot = parseInt(result[3]);
         //   game.jackpot = result[2].toString();
          //  game.nextdistributiontime = result[3].toString();


            for (let index = 0; index < result.length; index++) {
              console.log('Plotdata - Index: '+index+" Value: "+result[index].toString());
              }  
        } 
        else
        {
            console.log(error);
        }
};

function network_money (error, result) // NETWORK VIRTUAL CURRENCY STATS
{
        if(!error)
        {
           
            game.networkhodl = result[0].toNumber();
            game.networkhash = result[1].toNumber();

            for (let index = 0; index < result.length; index++) {
              console.log('Network money - Index: '+index+" Value: "+result[index].toString());
              }  
        } 
        else
        {
            console.log(error);
        }
}; 

function booster_init (error, result)
{
        if(!error)
        {
           /* public constant returns (address[5] _boosterHolders, uint currentPrice, uint currentIndex)*/ 

            game.boosterprice = result[1].toNumber();

            for (let index = 0; index < result.length; index++) {
              console.log('Booster init: - Index: '+index+" Value: "+result[index].toString());
              }  
        } 
        else
        {
            console.log(error);
        }
}; 


function buy_boost_button()
{
    buy_boost(game.boosterprice);
}



function buy_action_upgrade (data)
{
    var str = data;
    var res = str.split("-", 3);
    /* Data: category,id,count, */

    if(res[0]==2) // safe check
        buy_upgrade(res[1]);


}

function buy_action_army (data)
{
    var str = data;
    var res = str.split("-", 3);
    /* Data: category,id,count, */

    // game.attacker = [];
    // game.defender = [];

    console.log("Data: "+res[2]);

    var owned_supply = parseInt(game.attacker[res[1]]);
    var buying_count = parseInt(res[2]);
    var buy_id = parseInt(res[1]);
    var base_data = troopData[buy_id];
    
    if(base_data.eth !=0) // ETH SHOPING!
    {
        console.log(buy_id,base_data.eth);
        buy_army(buy_id,buying_count,(base_data.eth*buying_count));

       return 0; 
    }


    if(buying_count != 1000 && buying_count>0)
    {
    var price = buy_price(base_data.price,base_data.price,owned_supply,buying_count);

        if(price <= game.futurebalance)
        {
           console.log("Index: "+buy_id+" Coint: "+buying_count+" Price: "+price);
           buy_army(buy_id,buying_count,0);
        }
        else
        {
            buy_army(buy_id,buying_count,0);
        }
    }
    else
    {
        var count = buy_price_all(base_data.price,base_data.price,owned_supply,game.futurebalance);  
        var price = buy_price(base_data.price,base_data.price,owned_supply,count);

        if(count>=1)
        { 
            console.log("Index: "+buy_id+" Coint: "+count+" Price: "+price+"Owned: "+owned_supply);
            price_army(buy_id,count,owned_supply);
            buy_army(buy_id,count,0); 

        }

    }
}



function buy_action_rig (data)
{
    var str = data;
    var res = str.split("-", 3);
    /* Data: category,id,count, */

    // Check money!
    //console.log(game.rigpart[res[1]]);

    let rigID = res[1];

    var owned_supply = parseInt(game.rigpart[res[1]]);
    var buying_count = parseInt(res[2]);
    var base_data = rigData[rigID];

    if(base_data.eth !=0) // ETH SHOPING!
    {
        if(buying_count != 1000)
        {
        buy_rig_eth(rigID,limit_check(buying_count,owned_supply,base_data.limit));
        }
        else
        {
            var count = parseInt(game.ethbalance / base_data.eth); 
            buy_rig_eth(rigID,limit_check(count,owned_supply,base_data.limit));  
        }

       return 0; 
    }


    if(buying_count != 1000 && buying_count>0)
    {
    var price = buy_price(base_data.price,base_data.upgrade,owned_supply,buying_count);

        if(price <= game.futurebalance)
        {
           buy_rig(rigID,limit_check(buying_count,owned_supply,base_data.limit)); // Coin buy!
        }
        else
        {
            console.log(price); // TODO NOT POSSIBLE BUY!
        }
    }
    else
    {
        var count = buy_price_all(base_data.price,base_data.upgrade,owned_supply,game.futurebalance);     
        var price = buy_price(base_data.price,base_data.upgrade,owned_supply,count);

        if(count>=1)
        {
            buy_rig(rigID,limit_check(count,owned_supply,base_data.limit));
        }

    }

    return 0;
}

function limit_check(count,owned,limit)
{
    if(count+owned > limit)
    {
      count = limit-owned; 
    }

    return count;
}


// Calculate Buy Price ALL -- UPDATED VERSION
function buy_price_all(basePrice , pricePerLevel, owned, balance) 
    {
         basePrice = parseInt(basePrice);
         pricePerLevel = parseInt(pricePerLevel);
         owned = parseInt(owned);
        let count = 0;

      for (let i = 1; i < 1000; i++) 
        {
            count = i;

                    let price = 0;

                    price += (basePrice+(pricePerLevel*owned)) * count;
                    price += pricePerLevel * ([count * (count-1)] / 2);

               
               if(price>=balance)
               { 
                 return count-1;  
               }
               
               if(i==999)
               {
                return 999;  
               }
        } 
        
        return 0;
    }


// Calculate Buy Price -- UPDATED VERSION
function buy_price(basePrice , pricePerLevel, owned, count) 
    {
        let price = 0;

        basePrice = parseInt(basePrice);
        pricePerLevel = parseInt(pricePerLevel);
        owned = parseInt(owned);
        count = parseInt(count);

        price = 0;
        price += (basePrice + pricePerLevel * owned) * count;
        price += pricePerLevel * ((count-1) * count) / 2;

        return price;
    }


 // Update Owned Rig Parts -- FINISHED
 function update_army()
 {


    for (let index = 0; index < game.attacker.length; index++) 
    {
        if(typeof game.attacker[index]  != 'undefined')
        {
        let base_data = troopData[index];
         possible_buy = buy_price_all(base_data.price,base_data.price,game.attacker[index],game.futurebalance);

        let cost_next = buy_price(base_data.price , base_data.price, game.attacker[index], 1); //Get Price of next piece! 

        update_army_ui(index,game.attacker[index],possible_buy,cost_next);
        }
    }
 }


 // Update Owned Rig Parts -- FINISHED
 function update_rig()
 {
    let res =  game.rigdetails.split(",");

    for (let index = 0; index < res.length; index++) 
    {
        if(typeof res[index]  != 'undefined')
        {
   
        let base_data = rigData[index];


        let possible_buy = buy_price_all(base_data.price,base_data.upgrade,res[index],game.futurebalance);

         //console.log(possible_buy);

        let cost_next = buy_price(base_data.price , base_data.upgrade, res[index], 1); //Get Price of next piece! 

        update_rig_ui(index,res[index],possible_buy,cost_next);

        game.rigpart[index] = res[index];

        }
    }
 }


 // REMOVE BUY BUTTON FROM OWNED UPGRADES -- FINISHED
 function update_upgrades()
 {
    var res =  game.upgrades.split(",");

    for (let index = 0; index < res.length; index++) 
    {
        if(res[index] !=0)
        hide_upgrade(index); 
    }
 }

 function update_booster()
 {

    if(typeof game.hasbooster  != 'undefined')
        {
            update_booster_ui(game.hasbooster,game.boosterprice);
        }
 }



// MAIN LOOP
function update_balance(force)
{

    if(force == 1)
    {
        // Equal with reload the page!
        game.time = 0;  
        first_update = 0;
        window.windowage = 0;
    }

        // FIRST UPDATE
        if(first_update != 1 && parseInt(game.balance) > 0 && game.time!=0)
        {
            timediff = game.time - game.lastupdate;
            new_balance_diff = (game.time-game.lastupdate) * game.prodPerSec;     

            game.balance = parseInt(game.balance)+new_balance_diff;
            first_update = 1;
            update_dash_slow();
        }
        // FIRST UPDATE

    if(first_update==1)
        {
        game.futurebalance = game.balance + game.prodPerSec*window.windowage;
        game.current_unixtime = game.time+window.windowage;
        }

        if(game.immunityTime > 0 && game.immunityTime > game.time)
        {
           let distance_immune = game.immunityTime-game.time-window.windowage;  
           game.countdownimmune = countdown(distance_immune);
        }
        else
        {
            game.countdownimmune = "Attackable!";  
        }

        if(game.exhaustTime > 0 && game.exhaustTime > game.time)
        {
           distance_immune = game.exhaustTime-game.time-window.windowage;  
           game.countdownexhaust = "Ready in: "+countdown(distance_immune);
        }
        else
        {
            game.countdownexhaust = "Ready!";  
        }

}
// MAIN LOOP 


//SLOW LOOP!

function update_leaderboard()
{
       let  address = "";        
       let counter = game.leaderboard.length;

            if(game.totalminer>0 && counter<game.totalminer)
            {

                GetMinerAt(counter,function(res)
                {
                    address = res;

                    GetMinerData(address,function(result){
                        let minerdata =  result.toString();
                        minerdata = minerdata.split(",");

                            GetPVPData(address,function(result)
                            {

                                game.leaderboard[counter] = minerdata;
                                    game.leaderboard[counter][19] = address;
                                            let pvpdata =  result.toString();
                                                pvpdata = pvpdata.split(",");

                                    game.leaderboard[counter] = game.leaderboard[counter].concat(pvpdata);

            
                                            game.leaderboard.sort(function(a, b)
                                                    {
                                                        return b[0]-a[0];
                                                    });   
                                counter++;  
                            });
                        
                    }) 
                });
            }

            if(game.totalminer == 0)
            {
                GetTotalMinerCount(function(result)
                {
                 game.totalminer =  result;  
                 console.log("Totalminer: "+game.totalminer);
                });  
            }      

};




// START GAME -> AFTER LOADED!
$( document ).ready(function() {

    update_dash_slow();

        function update(){
        
            update_balance(0); // Non force update!

            if(first_update == 1)
            {
                update_dash();   
                update_rig();  
                update_army();
            }

        };

        function slow_update() 
        {
             update_leaderboard();
             if(first_update == 1)
                {
                update_upgrades();
                update_booster();
                }
        };


        setInterval(update, 300); // Main Loop every 100ms

        setInterval(startTime,1000);

        setInterval(slow_update,1000);

        setInterval(update_dash_slow,5000);  // 5 sec

        function startTime() {
            window.windowage = window.windowage+1;
        }


});