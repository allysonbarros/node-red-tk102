module.exports = function(RED) {
    "use strict";

    function fixGeo(one, two) {
      var minutes = one.substr(-7, 7);
      var degrees = parseInt(one.replace(minutes, ''), 10);

      one = degrees +(minutes / 60);
      one = parseFloat((two === 'S' || two === 'W' ? '-' : '') + one);

      return Math.round(one * 1000000) / 1000000;
    };

    function checksum(raw) {
      var str = raw.trim() .split(/[,*#]/);
      var strsum = parseInt(str[15], 10);
      var strchk = str.slice(2, 15) .join(',');
      var check = 0;
      var i;

      for(i = 0; i < strchk.length; i++) {
        check ^= strchk.charCodeAt(i);
      }

      check = parseInt(check.toString(16), 10);
      return(check === strsum);
    };

    function parseMessage(raw) {
      var result = null;
      var str = [];
      var datetime = '';
      var gpsdate = '';
      var gpstime = '';

      try {
        raw = raw.trim();
        str = raw.split(',');

        if(str.length === 18 && str[2] === 'GPRMC' || str.length === 28 && str[2] === 'GPRMC') {
          datetime = str[0].replace(/([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/, function(s, y, m, d, h, i) {
            return '20' + y + '-' + m + '-' + d + ' ' + h + ':' + i;
          });

          gpsdate = str[11].replace(/([0-9]{2})([0-9]{2})([0-9]{2})/, function(s, d, m, y) {
            return '20' + y + '-' + m + '-' + d;
          });

          gpstime = str[3].replace(/([0-9]{2})([0-9]{2})([0-9]{2})\.([0-9]{3})/, function(s0, h, i, s, ms) {
            return h + ':' + i + ':' + s + '.' + ms;
          });

          result = {
            raw: raw,
            datetime: datetime,
            phone: str[1],
            gps: {
              date: gpsdate,
              time: gpstime,
              signal: str[15] === 'F' ? 'full' : 'low',
              fix: str[4] === 'A' ? 'active' : 'invalid'
            },
            geo: {
              latitude: fixGeo(str[5], str[6]),
              longitude: fixGeo(str[7], str[8]),
              bearing: parseInt(str[10], 10)
            },
            speed: {
              knots: Math.round(str[9] * 1000) / 1000,
              kmh: Math.round(str[9] * 1.852 * 1000) / 1000,
              mph: Math.round(str[9] * 1.151 * 1000) / 1000
            },
            imei: str[17].replace('imei:', '').trim(),
            checksum: checksum(raw)
          };
        }
      } catch(e) {
        result = null;
      }

      return result;
    }

    function TK102MessageParserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // this.cellphone = config.cellphone;
        // this.imei = config.imei;

        this.on("input", function(msg) {
            msg.payload = parseMessage(msg.payload);
            node.send(msg);
            
            // if (this.cellphone == msg.payload.phone || this.imei == msg.payload.imei)
            //   node.send(msg);
            // else
            //   node.error("Atenção: O número de celular ou IMEI recebidos na mensagem não bate(m) com o informado na configuração.", msg);
        });
    }

    RED.nodes.registerType("tk102-message-parser", TK102MessageParserNode);
};