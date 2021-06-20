const compassCircle = document.querySelector('#self')
const isIOS =
  navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
  navigator.userAgent.match(/AppleWebKit/);
var el
function init(clonedElement,position) {
  el = clonedElement
  if (!isIOS) {
    window.addEventListener('deviceorientationabsolute', handler, true);
  }
  locationHandler(position)
}

function startCompass() {
  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handler, true);
        } else {
          alert('has to be allowed!');
        }
      })
      .catch(() => alert('not supported'));
  }
}

function handler(e) {
  compass = e.webkitCompassHeading || Math.abs(e.alpha - 360)
  el.style.transform = `rotate(${-compass}deg)`
}

let pointDegree;

function locationHandler(position) {
  // const { latitude, longitude } = position.coords;
  pointDegree = calcDegreeToPoint(position.lat, position.lng);

  if (pointDegree < 0) {
    pointDegree = pointDegree + 360;
  }
}

function calcDegreeToPoint(latitude, longitude) {
  // Qibla geolocation
  const point = {
    lat: 21.422487,
    lng: 39.826206
  };

  const phiK = (point.lat * Math.PI) / 180.0;
  const lambdaK = (point.lng * Math.PI) / 180.0;
  const phi = (latitude * Math.PI) / 180.0;
  const lambda = (longitude * Math.PI) / 180.0;
  const psi =
    (180.0 / Math.PI) *
    Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) -
      Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
  return Math.round(psi);
}