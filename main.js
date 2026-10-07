(function(){
var WA='265999324975';
function $(i){return document.getElementById(i)}

// Inquiry form -> WhatsApp
$('inq').addEventListener('submit',function(e){
  e.preventDefault();
  var t='Hello Mr Kamulira, my name is '+$('iname').value+'. I am interested in: '+$('isvc').value+'. '+$('imsg').value;
  window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(t),'_blank');
});

// Payment form
var pf=$('pf'),pm=$('pm'),pb=$('pb'),wc=$('wc');
function say(t){pm.textContent=t}
function finish(){pb.disabled=false}
function showConfirm(id,phone,amt){
  var t='Hello Mr Kamulira, I have paid MWK '+amt+' for "'+$('ps').value+'" from '+phone+'. Payment reference: '+id+'. My name is '+$('pname').value+'.';
  wc.href='https://wa.me/'+WA+'?text='+encodeURIComponent(t);
  wc.style.display='block';
}
function poll(id,phone,amt,n){
  fetch('/api/status?id='+encodeURIComponent(id)).then(function(r){return r.json()}).then(function(d){
    var s=(d.status||'').toLowerCase();
    if(s==='success'){say('Payment received. Thank you! Tap the green button to confirm with Mr Kamulira on WhatsApp.');showConfirm(id,phone,amt);finish()}
    else if(s==='failed'){say('The payment did not go through. Please check your PIN and balance, then try again.');finish()}
    else if(n>0){setTimeout(function(){poll(id,phone,amt,n-1)},4000)}
    else{say('Still waiting. If you approved the prompt, tap the green button to tell us.');showConfirm(id,phone,amt);finish()}
  }).catch(function(){say('Could not check the status. If you paid, tap the green button to tell us.');showConfirm(id,phone,amt);finish()});
}
pf.addEventListener('submit',function(e){
  e.preventDefault();
  var phone=$('pp').value,amt=$('pa').value;
  pb.disabled=true;wc.style.display='none';say('Sending the prompt to your phone...');
  fetch('/api/pay',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({phoneNumber:phone,amount:amt,provider:$('pn').value})})
  .then(function(r){return r.json()}).then(function(d){
    if(d.success&&d.chargeId){say('Check your phone and enter your PIN to approve.');poll(d.chargeId,phone,amt,30)}
    else{say(d.error||'Could not start the payment. Please try again.');finish()}
  }).catch(function(){say('Network problem. Please try again.');finish()});
});
})();
