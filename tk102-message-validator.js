module.exports = function(RED) {
    "use strict";

    function TK102MessageValidatorNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.cellphone = config.cellphone;
        this.imei = config.imei;

        this.on("input", function(msg) {
            if (this.cellphone == msg.payload.phone && this.imei == msg.payload.imei)
              node.send(msg);
            else
              node.error("Atenção: O número de celular ou IMEI recebidos na mensagem não bate(m) com o informado na configuração.", msg);
        });
    }

    RED.nodes.registerType("tk102-message-validator", TK102MessageValidatorNode);
};