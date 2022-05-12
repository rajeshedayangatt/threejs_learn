import React  from "react";




class RandomTextComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            images : ['t_plane_1.jpg','t_plane_2.jpg','t_plane_3.jpg','t_plane_4.jpg'],
            text1 : 'Text1',
            text2 : 'Text2',
            text3 : 'Text3',
            text4 : 'Text4',
            text5 : 'Text5',

        }


    }

    componentDidMount() {

    }

    imageEvent = (event) =>{
        console.log(this.props)

        this.props.changeTextureEvent(event.target.src)

        console.log(event.target.src)

    }

    textUpdate = (event) => {

        var str = event.target.value

        if(str.length > 6) {

            return;
        }

        this.setState({ [event.target.name] : str })

        this.props.changeTextureEvent(str,event.target.name)
    }


    render() {
        return(
            <div className="img-container">

                <input type="text" name="text1" value={this.state.text1} onChange={this.textUpdate}/>

                <input type="text" name="text2" value={this.state.text2} onChange={this.textUpdate} />

                <input type="text" name="text3" value={this.state.text3}  onChange={this.textUpdate}/>

                <input type="text" name="text4" value={this.state.text4}  onChange={this.textUpdate}/>

                <input type="text" name="text5" value={this.state.text5}  onChange={this.textUpdate}/>

                {/* {this.state.images.map(val => {
                    return (
                     <img key={val}  src={"/plane/"+val} class="images" onClick={this.imageEvent} />
                    )
                })} */}
            </div>
        )
    }
}


export default RandomTextComponent;