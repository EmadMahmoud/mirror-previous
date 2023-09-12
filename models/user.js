const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    profile: {
        things: [
            {
                thingId: {

                    type: Schema.Types.ObjectId,
                    ref: 'Thing',
                    required: true
                }
            }
        ]
    }

})

module.exports = mongoose.model('User', userSchema);