import React  from "react";




class RandomImageComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            images : ['t_plane_1.jpg','t_plane_2.jpg','t_plane_3.jpg','t_plane_4.jpg']
        }


    }

    componentDidMount() {

    }

    imageEvent = (event) =>{
        console.log(this.props)

        this.props.changeTextureEvent(event.target.src)

        console.log(event.target.src)

    }




    render() {
        return(
            <div className="img-container">

                {this.state.images.map(val => {
                    return (
                     <img key={val}  src={"/plane/"+val} class="images" onClick={this.imageEvent} />
                    )
                })}
            </div>
        )
    }
}


export default RandomImageComponent;