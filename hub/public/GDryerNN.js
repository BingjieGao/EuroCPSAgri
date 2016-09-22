/*
 * Created by my on 15/06/15.
 */

GDryerNN = (function() {

    //constructor
    function GDryerNN(cfg) {
        this._inMax = cfg.inMax;
        this._inMin = cfg.inMin;
        this._outMax = cfg.outMax;
        this._outMin = cfg.outMin;
        this._w = cfg.w;
        this._v = cfg.v;
        this._numIn = cfg.numIn;
        this._numOut = cfg.numOut;
        this._numN = cfg.numN;

        this._prdtime = 225 * 60 * 1000; //ms
    } //end constructor

    GDryerNN.prototype.outputObtainedBPNN = function(tdata) {
        //tdata formation is an obj array:
        //[{"timestamp": 1472563177019, "input": [8.446, 4.103]}, {"timestamp": 1472563477020, "input": [7.183, 5.663]},..]

        if (arguments.length != 1) {
            throw new Error('illegal argument count'); }

        //testing the obtained BPNN
        var i, j, k, sum;
        var cdv = [];
        var sumOut = [];
        var testD = [];
        var oNN = [];

        //preprocess testing data
        var inData = [];
        for (i = 0; i < tdata[0].input.length; i++) {
            cdv = [];

            for (j = 0; j < tdata.length; j++) {
                cdv.push(+tdata[j].input[i]);
            }

            inData.push(cdv);
        }

        var testDD = [];
        for (i = 0; i < inData[0].length; i++) {

            for (j = 0; j < this._numIn; j++) {
                inData[j][i] = (inData[j][i] - this._inMin[j] + 1) / (this._inMax[j] - this._inMin[j] + 1);
            }

            for (j = 0; j < this._numN; j++) {
                sum = 0;

                for (k = 0; k < this._numIn; k++) {
                    sum += this._w[k][j] * inData[k][i];
                }

                oNN[j] = 1 / (1 + Math.exp(-1 * sum));
            }

            testD = [];
            for (j = 0; j < this._numOut; j++) {
                sumOut[j] = 0;

                for (k = 0; k < this._numN; k++) {
                    sumOut[j] += this._v[j][k] * oNN[k];
                }

                sumOut[j] = sumOut[j] * (this._outMax[j] - this._outMin[j] + 1) + this._outMin[j] - 1;
                testD.push(sumOut[j]);
            }

            testDD.push(testD);
        }

        //outdata formation is an obj array:
        //[{"timestamp": 1472576677019, "output": [12.39]}, {"timestamp": 1472576977020, "output": [11.76]},..]
        var outdata = [];
        var jdata = {};
        for (i = 0; i < tdata.length; i++) {
            jdata = {};

            jdata.timestamp = tdata[i].timestamp + this._prdtime;
            jdata.output = [];

            for (j = 0; j < this._numOut; j++) {
                jdata.output.push(testDD[i][j]);
            }

            outdata.push(jdata);
        }

        return outdata;
    }; //end outputObtainedBPNN

    return GDryerNN;

}()); //End GDryerNN
