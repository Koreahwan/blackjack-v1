function InitGame(){ // 게임 초기화(wallet, gamedeck 제외 모든 변수)
    dealerhand, playerhands=[];
    betmoney=0;
    insurancemoney=0;
    insurancecheck=0;
    document.getElementById('walletid').innerHTML=sessionStorage.wallet;

}

// 새 게임을 하려고 새로고침하면 gamedeck과 wallet이 초기화되는 문제가 있음
// >> 이건 DB를 배워야 해결 가능, 일단 sessionstorage로 구현(game.html에서 wallet 초기화)

function Suffledeck(){
    gamedeck=originaldeck;
    gamedeck.sort(() => Math.random() - 0.5);
}

function main1(){
    document.getElementsByClassName("bets")[0].setAttribute("hidden","");
    document.getElementsByClassName("bets")[1].setAttribute("hidden","");
    betmoney=Number(document.getElementById("betmoney").value);
    document.getElementById('betmoneyid').innerHTML="BET MONEY : "+betmoney;
    sessionStorage.wallet=Number(sessionStorage.wallet)-betmoney;
    document.getElementById('walletid').innerHTML=sessionStorage.wallet;
    
    //playerhands.push([gamedeck[0]]);
    playerhands.push(["5S"]);
    gamedeck.shift();
    document.getElementById("pcardspace").innerHTML+='<img src="static/'+playerhands[0][0]+'.png" height="100%">';
    
    dealerhand.push(gamedeck[0]);
    //dealerhand.push("AH");
    gamedeck.shift();
    document.getElementById("dcardspace").innerHTML+='<img src="static/'+dealerhand[0]+'.png" height="100%">';
    
    //playerhands[0].push(gamedeck[0]);
    playerhands[0].push("5C");
    gamedeck.shift();
    document.getElementById("pcardspace").innerHTML+='<img src="static/'+playerhands[0][1]+'.png" height="100%">';
    
    dealerhand.push(gamedeck[0]);
    //dealerhand.push("KC");
    gamedeck.shift();
    document.getElementById("dcardspace").innerHTML+='<img src="static/gray_back.png" height="100%">';
    
    if (IsBlackjack(playerhands[0])){
        if (IsBlackjack(dealerhand)){
            document.getElementById("dcardspace").children[1].src = 'static/' + dealerhand[1] + '.png';
            document.getElementById('dsum').innerHTML="BLACKJACK";
            document.getElementById('psum').innerHTML="BLACKJACK";
            GameresultUpdate("DRAW",0);
        } else {
            document.getElementById("dcardspace").children[1].src = 'static/' + dealerhand[1] + '.png';
            document.getElementById('dsum').innerHTML=HandSum(dealerhand);
            document.getElementById('psum').innerHTML="BLACKJACK";
            GameresultUpdate("BLACKJACK!! YOU WIN!",2);
        }
    } else {
        document.getElementById('hit').removeAttribute("hidden");
        document.getElementById('stand').removeAttribute("hidden");
        document.getElementById('doubledown').removeAttribute("hidden");
        if (playerhands[0][0].slice(-3,-1)==playerhands[0][1].slice(-3,-1)){
            document.getElementById('split').removeAttribute("hidden");
        }
        if (dealerhand[0][0]=="A"){
            document.getElementById('insurance').removeAttribute("hidden");
        }
        document.getElementById('psum').innerHTML=HandSum(playerhand);
    }
}

const Playeraction={
    hit(){ // 카드 하나 더 받기
        playerhands[currentHandIndex].push(gamedeck[0]);
        gamedeck.shift();
        document.getElementById("pcardspace").innerHTML+='<img src="static/'+playerhand.slice(-1)[0]+'.png" height="100%">';
        document.getElementById('psum').innerHTML=HandSum(playerhand);
        if (IsBust(playerhand)){
            document.getElementById("dcardspace").children[1].src = 'static/' + dealerhand[1] + '.png';
            SumUpdate();
            GameresultUpdate("BUST!!",-1);
        }
    },
    stand(x){  // 멈추기, 딜러 행동 구현
        document.getElementById("dcardspace").children[1].src = 'static/' + dealerhand[1] + '.png';
        SumUpdate();
        if(IsBlackjack(dealerhand)){
            if(insurancecheck==1){
                GameresultUpdate("YOUR INSURANCE HIT!",0);
            } else {
                GameresultUpdate("YOU LOSE",-1);
            }
            
        } else {
            while(HandSum(dealerhand)<=16){
                dealerhand.push(gamedeck[0]);
                gamedeck.shift();
                document.getElementById("dcardspace").innerHTML+='<img src="static/'+dealerhand.slice(-1)[0]+'.png" height="100%">';
                SumUpdate();
            }
            if (IsBust(dealerhand)){
                    GameresultUpdate("Dealer BUST!! YOU WIN!",1);
            } else {
                if(HandSum(playerhand)<HandSum(dealerhand)){
                    GameresultUpdate("YOU LOSE",-1);
                } else if (HandSum(playerhand)==HandSum(dealerhand)) {
                    GameresultUpdate("DRAW",0);
                } else if (HandSum(playerhand)>HandSum(dealerhand)) {
                    GameresultUpdate("YOU WIN!",1);
                }
            }
            
        }
    },
    split(){ // 처음에 같은 카드를 받았을 경우/ 나눠서 2개의 게임으로 진행, 단 Split에는 제한이 없음 > 구현을 위해서는 playerhand라는 1차원 배열이 아닌 playerhands라는 2차원 배열 사용 필요
    
    },
    doubledown(x){ // 베팅액을 2배로 올리고 카드는 하나만 더 받기
        document.getElementById('doubledown').setAttribute("hidden","");
        sessionStorage.wallet=Number(sessionStorage.wallet)-betmoney
        betmoney *= 2;
        document.getElementById('betmoneyid').innerHTML="BET MONEY : "+betmoney;
        document.getElementById('walletid').innerHTML=sessionStorage.wallet;
        Playeraction.hit();
        if (IsBust(playerhand)){
            document.getElementById("dcardspace").children[1].src = 'static/' + dealerhand[1] + '.png';
            GameresultUpdate("BUST!!",-1);
        } else {
            Playeraction.stand();
        }
    },
    insurance(x){ // 딜러의 오픈 카드가 A일 경우 베팅액의 절반만큼 Insurance를 걸고 딜러가 블랙잭인 경우 베팅액만큼, 아닐경우 InsuranceMoney 전부 손실, Insurance를 맞추면 본전, 못 맞추면 그냥 InsuranceMoney만큼 손실
        document.getElementById('insurance').setAttribute("hidden","");
        insurancemoney=Math.floor(betmoney/2)
        insurancecheck=1;
    }
    
}

function IsBust(hand){
    if(HandSum(hand)>21){
        return true;
    }else{
        return false;
    }
}

function IsBlackjack(hand){
    tmphand=hand.slice();
    for (i=0;i<2;i++){
        tmphand[i]=tmphand[i].slice(-3,-1);
    }
    if (tmphand.length==2 && tmphand.includes("A") && tmphand.some(card=>loyal.includes(card))){ // hand가 2개이고 A + 10,J,Q,K 조합
        return true;
    }else{
        return false;
    }
}

/**
 * 게임 종료 및 wallet 업데이트, 플레이어 기준 x가 -1이면 패배, 0이면 무승부, 1이면 승리, 2이면 블랙잭으로 승리
 */
function GameresultUpdate(str,x){
    for (i=0;i<5;i++){
        document.getElementsByClassName("mybuttons")[0][i].setAttribute("hidden","");
    }
    document.getElementById('resultarea').innerHTML=str;
    document.getElementById('resultarea').innerHTML+='<button onClick="location.reload(true)">  새 게임</button>';
    if (x==0){sessionStorage.wallet = Number(sessionStorage.wallet) + betmoney}
    else if(x==1){sessionStorage.wallet = Number(sessionStorage.wallet) + 2*betmoney}
    else if(x==2){sessionStorage.wallet = Number(sessionStorage.wallet) + (2.5*betmoney | 0)} // float에서 int로 형 변환
    document.getElementById('walletid').innerHTML=sessionStorage.wallet;
}

/** 패의 합계 계산
 */
function HandSum(hand){
    let sum=0;
    let Acount=0;
    for (let element of hand){
        if (element.slice(-3,-1)=="A"){
            Acount+=1;
        } else if (loyal.includes(element.slice(-3,-1))){
            sum += 10;
        } else {
            sum += Number(element.slice(-3,-1));
        }
    }
    for (i=0;i<Acount;i++){
        if (sum+11>21){
            sum+=1;
        } else {
            sum+=11;
        }
    }
    return sum
}

/**
 * 패의 합계 업데이트
 */
function SumUpdate(){
    document.getElementById('dsum').innerHTML=HandSum(dealerhand);
    document.getElementById('psum').innerHTML=HandSum(playerhand);
}

function main2(){

}


