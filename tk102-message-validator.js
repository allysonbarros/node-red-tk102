module.exports = function(RED) {
    "use strict";

    function TK102MessageValidatorNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.imei = config.imei;

        this.on("input", function(msg) {
            if (this.imei == msg.payload.imei)
              node.send(msg);
            else
              node.error("Atenção: O IMEI recebido na mensagem não bate com o informado na configuração.", msg);
        });
    }

    RED.nodes.registerType("tk102-message-validator", TK102MessageValidatorNode);
};
