const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
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

});

userSchema.methods.deleteAThing = function (thingId) {
    const things = [...this.profile.things];
    const updatedThings = things.filter(thing => thing.thingId.toString() !== thingId.toString());
    this.profile.things = updatedThings;
    return this.save();
}




module.exports = mongoose.model('User', userSchema);