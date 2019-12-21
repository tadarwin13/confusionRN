import React, { Component } from "react";
import { Card } from "react-native-elements";
import { postFavorite } from "../redux/ActionCreators";
import { Rating } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input } from "react-native-elements";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Button,
  Alert,
  PanResponder
} from "react-native";
import * as Animatable from "react-native-animatable";

const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = dispatch => ({
  postFavorite: dishId => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
  const dish = props.dish;

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx < -200) return "rtl";
    else if (dx > 200) return "ltr";
    else return false;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderEnd: (e, gestureState) => {
      const drag = recognizeDrag(gestureState);
      if (drag == "rtl") {
        Alert.alert(
          "Add Favorite",
          "Are you sure you wish to add " + dish.name + " to favorite?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () => {
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress();
              }
            }
          ],
          { cancelable: false }
        );
        return true;
      }
    }
  });
  const shareDish = (title, message, url) => {
    Share.share(
      {
        title: title,
        message: title + ": " + message + " " + url,
        url: url
      },
      {
        dialogTitle: "Share " + title
      }
    );
  };

  if (dish != null) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        {...panResponder.panHandlers}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          ><Text style={{ margin: 10 }}>{dish.description}</Text>
          <Icon
            raised
            reverse
            name={props.favorite ? "heart" : "heart-o"}
            type="font-awesome"
            color="#f50"
            onPress={() =>
              props.favorite
                ? console.log("Already favorite")
                : props.markFavorite(dish.dishId)
            }
          />
          <Icon
            raised
            reverse
            name={pencil}
            type="font-awesome"
            color="#f50"
            onPress={() => props.toggleModal()}
          />
          <Icon
            raised
            reverse
            name="share"
            type="font-awesome"
            color="#51D2A8"
            style={styles.cardItem}
            onPress={() =>
              shareDish(dish.name, dish.description, baseUrl + dish.image)
            }
          />
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}
function RenderComments(props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text>
        <Text style={{ fontSize: 12 }}>
          {"-- " + item.author + ", " + item.date}{" "}
        </Text>
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class DishDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 5,
      author: "",
      comment: "",
      favorites: [],
      showModal: false
    };
  }

  static navigationOptions = {
    title: "Dish Details"
  };

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  toggleModal(dishId) {
    this.props.onShowModal(dishId);
  }

  addNewComment(dishId, rating, author, comment) {
    this.props.postComment(dishId, rating, author, comment);
  }

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          toggleModal={() => this.toggleModal}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            comment => comment.dishId === dishId
          )}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onRequestClose={() => this.toggleModal()}
        >
          <View style={styles.modal}>
            Rating: {this.state.rating}
            <Rating
              showRating
              onFinishRating={this.ratingCompleted}
              style={{ paddingVertical: 10 }}
            />
            <Rating
              type="star"
              ratingCount={5}
              imageSize={60}
              showRating={true}
              startingvalue={5}
              onFinishRating={rating => this.setState({ rating: rating })}
            />
            <Text style={styles.modalText}>
              Author: {this.state.author ? "Yes" : "No"}
              <Input
                placeholder="Author"
                leftIcon={<Icon name="user" type="font-awsome" />}
                onChangeText={value => this.setState({ author: vale })}
              />
            </Text>
            <Text style={styles.modalText}>
              Comment: {this.state.date}
              <Input
                placeholder="Comment"
                leftIcon={<Icon name="comment" type="font-awsome" />}
                onChangeText={value => this.setState({ author: vale })}
              />
            </Text>
            <View>
              <Button
                onPress={() => {
                  this.addNewComment(
                    dishId,
                    this.state.rating,
                    this.state.author,
                    this.state.comment
                  );
                  this.resetForm();
                }}
                color="#512DA8"
                title="SUBMIT"
              />
            </View>
            <View>
              <Button
                onPress={() => {
                  this.toggleModal();
                }}
                color="grey"
                title="CANCEL"
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);
