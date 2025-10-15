<?php

namespace App\Http\Controllers\Authenticated\Administrator;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Mail\BookReservationStatus;
use App\Models\{
    Book,
    BookCategory,
    BookReservation,
    AuditTrail
};

class LibraryController extends Controller
{
    public function base64ToPng($base64String, $filename)
    {
        $base64String = preg_replace('/^data:image\/\w+;base64,/', '', $base64String);
        $decodedString = base64_decode($base64String, true);

        if ($decodedString === false) {
            throw new Exception('Base64 decoding failed');
        }

        $filePath = public_path('book-images/' . $filename);

        if (!file_put_contents($filePath, $decodedString)) {
            throw new Exception('Failed to save image');
        }

        return $filePath;
    }

    /** books */
    public function get_books(Request $request) {
        $books = Book::withCount(['hasData'])->with(['category'])->get();
        return response()->json(['books' => $books], 200);
    }

    public function get_book_reservation (Request $request) {
        $reservations = BookReservation::with([
            'borrower',
            'book',
            'book.category'
        ])->orderBy('created_at', 'DESC')->get();
        return response()->json(['reservations' => $reservations], 200);
    }

    public function create_or_update_book(Request $request) {
        $validations = [
            'name' => 'required|string',
            'description' => 'required|string',
            'category' => 'required',
            'stock' => 'required|numeric',
            'photo' => 'required'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();
                
                $this_book = $request->httpMethod == "POST" 
                        ? new Book
                        : Book::find($request->documentId);

                $this_book->name = $request->name;
                $this_book->description = $request->description;
                $this_book->stock = $request->stock;
                $this_book->available_stock = $request->httpMethod === "POST"
                    ? $request->stock
                    : ($request->stock > $this_book->stock
                        ? ($this_book->available_stock + ($this_book->stock - $request->stock))
                        : $this_book->available_stock);
 
                $this_book->book_category_id = $request->category;

                if($request->photo){
                    if($this_book->photo && ($request->photo !== $this_book->photo)) {
                        if(file_exists(public_path('book-images/' . $this_book->photo))){
                            unlink(public_path('book-images/' . $this_book->photo));
                        }
                    }

                    $image_name = Str::uuid() . '.png';
                    $this->base64ToPng($request->photo, $image_name);
                    $this_book->photo = $image_name;
                }

                $this_book->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a book. ID# " . $this_book->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a book. ID# " . $this_book->id], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function update_reservation (Request $request) {
        $validations = ['status' => 'required|string'];
        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();
            
                $this_reservation = BookReservation::find($request->documentId);
                $this_reservation->status = $request->status;
                $this_reservation->save();

                $this_book = Book::find($this_reservation->book->id);
                if($request->status === "APPROVED"){
                    $this_book->available_stock -= 1;
                    $this_book->save(); 
                } else if($request->status === "COMPLETED") {
                    $this_book->available_stock += 1;
                    $this_book->save(); 
                }

                \Mail::to($this_reservation->borrower->email)->send(new BookReservationStatus(['status' => $request->status]));

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've updated a book request. REQID# " . $request->documentId;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've updated a book request. REQID# " . $request->documentId], 200);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_book (Request $request, int $book_id) {
        try {
            DB::beginTransaction();

            $this_book = Book::withCount(['hasData'])->where('id', $book_id)->first();
            if($this_book->has_data_count > 0) {
                return response()->json(['message' => "Can't remove book. It already has connected data."], 200);
            } else {
                $this_book->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed book. ID# $book_id";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed book. ID# $book_id"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    /** categories */
    public function get_categories (Request $request) {
        $categories = BookCategory::withCount(['hasData'])->get();
        return response()->json(['categories' => $categories], 200);
    }

    public function get_active_categories (Request $request) {
        $categories = BookCategory::where('status', 'ACTIVE')->get();
        return response()->json(['categories' => $categories], 200);
    }

    public function create_or_update_category (Request $request) {
        $validations = [
            'name' => 'required|string'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();
                
                $this_category = $request->httpMethod == "POST" 
                    ? new BookCategory
                    : BookCategory::find($request->documentId);

                $this_category->name = $request->name;
                if($request->status) $this_category->status = $request->status;
                $this_category->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a book category. ID# " . $this_category->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a book category. ID# " . $this_category->id], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_category (Request $request, int $category_id) {
        try {
            DB::beginTransaction();

            $this_book_category = BookCategory::withCount(['hasData'])->where('id', $category_id)->first();
            if($this_book_category->has_data_count > 0) {
                return response()->json(['message' => "Can't remove book category. It already has connected data."], 200);
            } else {
                $this_book_category->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed book category. ID# $category_id";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed book category. ID# $category_id"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
